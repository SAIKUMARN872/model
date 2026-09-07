"""
Agent API routes.

Provides endpoints for listing AI agents, retrieving agent details,
executing an agent, and checking agent health.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.services.agent import AgentService

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


def get_agent_service() -> AgentService:
    """
    Dependency for AgentService.
    """
    return AgentService()


@router.get(
    "",
    response_model=ApiResponse[list[dict[str, Any]]],
    summary="List AI agents",
)
async def list_agents(
    include_disabled: bool = Query(
        default=False,
        description="Include disabled agents.",
    ),
    service: AgentService = Depends(get_agent_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[list[dict[str, Any]]]:
    """
    Return all available AI agents.
    """

    agents = await service.list_agents(
        include_disabled=include_disabled,
    )

    return ApiResponse.ok(
        data=agents,
        message="Agents retrieved successfully.",
    )


@router.get(
    "/{agent_id}",
    response_model=ApiResponse[dict[str, Any]],
    summary="Get agent",
)
async def get_agent(
    agent_id: str,
    service: AgentService = Depends(get_agent_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[dict[str, Any]]:
    """
    Get an agent by identifier.
    """

    agent = await service.get_agent(agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found.",
        )

    return ApiResponse.ok(
        data=agent,
        message="Agent retrieved successfully.",
    )


@router.post(
    "/{agent_id}/execute",
    response_model=ApiResponse[dict[str, Any]],
    summary="Execute an agent",
)
async def execute_agent(
    agent_id: str,
    payload: dict[str, Any],
    service: AgentService = Depends(get_agent_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[dict[str, Any]]:
    """
    Execute an AI agent.
    """

    result = await service.execute(
        agent_id=agent_id,
        payload=payload,
        user=current_user,
    )

    return ApiResponse.ok(
        data=result,
        message="Agent executed successfully.",
    )


@router.get(
    "/{agent_id}/health",
    response_model=ApiResponse[dict[str, Any]],
    summary="Agent health",
)
async def health(
    agent_id: str,
    service: AgentService = Depends(get_agent_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[dict[str, Any]]:
    """
    Check agent health.
    """

    health_status = await service.health(agent_id)

    return ApiResponse.ok(
        data=health_status,
        message="Agent health retrieved successfully.",
    ) 