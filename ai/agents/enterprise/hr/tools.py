from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import HRRecord, HRStatus, require_text


class HRTools:
    """Process-local HR records. No emails, payroll, or external HR calls."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.employees: dict[str, HRRecord] = {}
        self.candidates: dict[str, HRRecord] = {}
        self.interviews: dict[str, HRRecord] = {}
        self.leave_requests: dict[str, HRRecord] = {}
        self.onboarding_requests: dict[str, HRRecord] = {}
        self.attendance: list[dict[str, Any]] = []
        self.performance_reviews: list[dict[str, Any]] = []

    @staticmethod
    def _id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    def create_employee(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = require_text(payload, "name")
        email = require_text(payload, "email").lower()
        with self._lock:
            if any(r.data.get("email") == email for r in self.employees.values()):
                raise ValueError("An employee with this email already exists")
            record_id = self._id("emp")
            data = {
                "name": name,
                "email": email,
                "department": require_text(payload, "department"),
                "job_title": require_text(payload, "job_title"),
                "manager": payload.get("manager"),
            }
            self.employees[record_id] = HRRecord(
                record_id, "employee", data, HRStatus.CREATED
            )
            return {"id": record_id, **data, "status": HRStatus.CREATED}

    def create_candidate(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = require_text(payload, "name")
        email = require_text(payload, "email").lower()
        role = require_text(payload, "role")
        with self._lock:
            record_id = self._id("cand")
            data = {
                "name": name,
                "email": email,
                "role": role,
                "experience_years": payload.get("experience_years"),
                "skills": payload.get("skills", []),
                "screening_status": "not_screened",
            }
            self.candidates[record_id] = HRRecord(
                record_id, "candidate", data, HRStatus.CREATED
            )
            return {"id": record_id, **data, "status": HRStatus.CREATED}

    def screen_candidate(self, payload: dict[str, Any]) -> dict[str, Any]:
        candidate_id = require_text(payload, "candidate_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"shortlisted", "not_shortlisted", "needs_review"}:
            raise ValueError(
                "decision must be shortlisted, not_shortlisted, or needs_review"
            )
        with self._lock:
            candidate = self.candidates.get(candidate_id)
            if candidate is None:
                raise ValueError("Candidate not found")
            candidate.data["screening_status"] = decision
            candidate.status = {
                "shortlisted": HRStatus.SHORTLISTED,
                "not_shortlisted": HRStatus.NOT_SHORTLISTED,
                "needs_review": HRStatus.UNDER_REVIEW,
            }[decision]
            return {
                "candidate_id": candidate_id,
                "screening_status": decision,
                "status": candidate.status,
                "note": "Screening decision recorded; no hiring decision was made automatically.",
            }

    def schedule_interview(self, payload: dict[str, Any]) -> dict[str, Any]:
        candidate_id = require_text(payload, "candidate_id")
        interview_at = require_text(payload, "interview_at")
        interviewer = require_text(payload, "interviewer")
        with self._lock:
            candidate = self.candidates.get(candidate_id)
            if candidate is None:
                raise ValueError("Candidate not found")
            if candidate.data.get("screening_status") != "shortlisted":
                raise ValueError("Only shortlisted candidates can be scheduled")
            interview_id = self._id("int")
            data = {
                "candidate_id": candidate_id,
                "interview_at": interview_at,
                "interviewer": interviewer,
                "meeting_link": payload.get("meeting_link"),
            }
            self.interviews[interview_id] = HRRecord(
                interview_id, "interview", data, HRStatus.SCHEDULED
            )
            return {"id": interview_id, **data, "status": HRStatus.SCHEDULED,
                    "note": "Interview recorded locally; no calendar invite was sent."}

    def record_interview(self, payload: dict[str, Any]) -> dict[str, Any]:
        interview_id = require_text(payload, "interview_id")
        feedback = require_text(payload, "feedback")
        with self._lock:
            interview = self.interviews.get(interview_id)
            if interview is None:
                raise ValueError("Interview not found")
            interview.data["feedback"] = feedback
            interview.data["recommendation"] = payload.get("recommendation", "pending")
            interview.status = HRStatus.RECORDED
            return {"id": interview_id, **interview.data, "status": HRStatus.RECORDED}

    def request_onboarding(self, payload: dict[str, Any]) -> dict[str, Any]:
        candidate_id = require_text(payload, "candidate_id")
        with self._lock:
            if candidate_id not in self.candidates:
                raise ValueError("Candidate not found")
            request_id = self._id("onb")
            data = {
                "candidate_id": candidate_id,
                "start_date": payload.get("start_date"),
                "department": payload.get("department"),
                "status": HRStatus.PENDING_APPROVAL,
            }
            self.onboarding_requests[request_id] = HRRecord(
                request_id, "onboarding", data, HRStatus.PENDING_APPROVAL
            )
            return {
                "id": request_id,
                **data,
                "note": "Pending authorized approval; employee account and payroll are not created.",
            }

    def approve_onboarding(self, payload: dict[str, Any]) -> dict[str, Any]:
        request_id = require_text(payload, "request_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approved", "rejected"}:
            raise ValueError("decision must be approved or rejected")
        with self._lock:
            request = self.onboarding_requests.get(request_id)
            if request is None:
                raise ValueError("Onboarding request not found")
            request.status = HRStatus.APPROVED if decision == "approved" else HRStatus.REJECTED
            request.data["status"] = request.status
            request.data["decision"] = decision
            return {
                "id": request_id,
                **request.data,
                "note": "Approval recorded locally; external onboarding steps remain unexecuted.",
            }

    def submit_leave_request(self, payload: dict[str, Any]) -> dict[str, Any]:
        employee_id = require_text(payload, "employee_id")
        start_date = require_text(payload, "start_date")
        end_date = require_text(payload, "end_date")
        reason = require_text(payload, "reason")
        with self._lock:
            if employee_id not in self.employees:
                raise ValueError("Employee not found")
            request_id = self._id("leave")
            data = {
                "employee_id": employee_id,
                "start_date": start_date,
                "end_date": end_date,
                "reason": reason,
                "decision": "pending",
            }
            self.leave_requests[request_id] = HRRecord(
                request_id, "leave_request", data, HRStatus.PENDING_APPROVAL
            )
            return {"id": request_id, **data, "status": HRStatus.PENDING_APPROVAL}

    def review_leave_request(self, payload: dict[str, Any]) -> dict[str, Any]:
        request_id = require_text(payload, "request_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approved", "rejected"}:
            raise ValueError("decision must be approved or rejected")
        with self._lock:
            request = self.leave_requests.get(request_id)
            if request is None:
                raise ValueError("Leave request not found")
            request.status = HRStatus.APPROVED if decision == "approved" else HRStatus.REJECTED
            request.data["decision"] = decision
            request.data["status"] = request.status
            return {"id": request_id, **request.data}

    def record_attendance(self, payload: dict[str, Any]) -> dict[str, Any]:
        employee_id = require_text(payload, "employee_id")
        date = require_text(payload, "date")
        status = require_text(payload, "attendance_status").lower()
        if status not in {"present", "absent", "remote", "half_day", "on_leave"}:
            raise ValueError("Unsupported attendance_status")
        with self._lock:
            if employee_id not in self.employees:
                raise ValueError("Employee not found")
            record = {
                "id": self._id("att"),
                "employee_id": employee_id,
                "date": date,
                "attendance_status": status,
            }
            self.attendance.append(record)
            return {**record, "status": HRStatus.RECORDED}

    def record_performance_review(self, payload: dict[str, Any]) -> dict[str, Any]:
        employee_id = require_text(payload, "employee_id")
        reviewer = require_text(payload, "reviewer")
        summary = require_text(payload, "summary")
        rating = payload.get("rating")
        if isinstance(rating, bool) or not isinstance(rating, (int, float)) or not 1 <= rating <= 5:
            raise ValueError("rating must be a number from 1 to 5")
        with self._lock:
            if employee_id not in self.employees:
                raise ValueError("Employee not found")
            record = {
                "id": self._id("perf"),
                "employee_id": employee_id,
                "reviewer": reviewer,
                "summary": summary,
                "rating": rating,
            }
            self.performance_reviews.append(record)
            return {**record, "status": HRStatus.RECORDED}
