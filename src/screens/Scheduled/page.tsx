
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type TaskStatus = "Active" | "Paused" | "Completed";

type ScheduledTask = {
  id: string;
  title: string;
  prompt: string;
  schedule: string;
  status: TaskStatus;
};

type Recommendation = {
  emoji: string;
  title: string;
  prompt: string;
  featured?: boolean;
};

type Props = {
  onBack?: () => void;
  onNewTask?: () => void;
};

const FILTERS: TaskStatus[] = ["Active", "Paused", "Completed"];

const REPEAT_OPTIONS = [
  "Once",
  "Daily",
  "Weekly",
  "Monthly",
  "Custom",
] as const;

const RECOMMENDATIONS: Recommendation[] = [
  { emoji: "🗣️", title: "Help me learn a language", prompt: "Help me learn a new language with daily lessons, vocabulary, and practice questions." },
  { emoji: "📰", title: "Update me on the news", prompt: "Give me a concise daily news briefing with reliable sources." },
  { emoji: "🏡", title: "Help me submit my insurance claim", prompt: "Help me organize the information and documents needed for my insurance claim.", featured: true },
  { emoji: "📰", title: "Keep me updated on a topic", prompt: "Monitor important developments about a topic I choose and summarize meaningful updates." },
  { emoji: "💌", title: "Find useful deals in my inbox", prompt: "Review authorized email information for useful deals and summarize relevant offers.", featured: true },
  { emoji: "🏃", title: "Plan workouts that fit my goals", prompt: "Create a workout plan that fits my fitness goals and send me a daily workout reminder." },
  { emoji: "📚", title: "Find my next favorite book", prompt: "Recommend books based on my interests and send me a weekly reading recommendation." },
  { emoji: "👗", title: "Outfit ideas based on my closet", prompt: "Suggest outfit combinations for the day based on clothing items I describe." },
  { emoji: "💼", title: "Help me prepare for interviews", prompt: "Give me daily interview practice questions, sample answers, and feedback for my target role." },
  { emoji: "🔎", title: "Find jobs that match my skills", prompt: "Prepare a daily digest of relevant job openings matching my skills and preferred location." },
  { emoji: "💻", title: "Help me improve my coding", prompt: "Give me a daily coding exercise with hints, a solution, and a short explanation." },
  { emoji: "📖", title: "Teach me something new", prompt: "Teach me one useful concept each day with a simple explanation and example." },
  { emoji: "🌐", title: "Track AI and technology news", prompt: "Summarize important AI and technology developments with sources each morning." },
  { emoji: "📈", title: "Give me a weekly industry update", prompt: "Prepare a weekly industry update covering what happened, why it matters, and what to watch next." },
  { emoji: "🧠", title: "Improve my communication skills", prompt: "Give me a daily English communication exercise with examples and corrections." },
  { emoji: "🎯", title: "Help me reach my goals", prompt: "Help me review my goals, choose priorities, and plan the next small action each morning." },
  { emoji: "🗓️", title: "Plan my day", prompt: "Help me create a practical daily plan from my priorities and available time." },
  { emoji: "⏰", title: "Remind me about important tasks", prompt: "Remind me about the important tasks and deadlines I specify." },
  { emoji: "📝", title: "Prepare a daily to-do list", prompt: "Create a concise daily checklist from my priorities and unfinished tasks." },
  { emoji: "📊", title: "Summarize my weekly progress", prompt: "Help me review my weekly progress, completed work, challenges, and next steps." },
  { emoji: "💰", title: "Review my spending habits", prompt: "Help me review spending information I provide and identify practical ways to save." },
  { emoji: "🍲", title: "Plan meals for the week", prompt: "Create a weekly meal plan based on my preferences, budget, and available ingredients." },
  { emoji: "💧", title: "Build healthy daily habits", prompt: "Help me maintain a simple daily wellness checklist and review my habit progress." },
  { emoji: "🧘", title: "Make time for mindfulness", prompt: "Send me a short daily mindfulness exercise and a reflection prompt." },
  { emoji: "✈️", title: "Plan my next trip", prompt: "Help me research travel ideas, compare options, and prepare a travel checklist." },
  { emoji: "🎬", title: "Find something to watch", prompt: "Recommend movies or shows each week based on the genres I enjoy." },
  { emoji: "🛍️", title: "Track products and prices", prompt: "Help me monitor products and prices using available sources and summarize meaningful changes." },
  { emoji: "🚀", title: "Grow my startup", prompt: "Give me a weekly startup research brief with market trends, competitor updates, and action ideas." },
  { emoji: "🤝", title: "Improve customer follow-ups", prompt: "Help me prepare a daily list of customer follow-ups and draft appropriate messages from information I provide." },
  { emoji: "📣", title: "Plan social media content", prompt: "Create a weekly social media content plan with post ideas and suggested captions." },
  { emoji: "📧", title: "Prepare my email summary", prompt: "Summarize important emails from an authorized connected inbox and highlight items needing attention." },
  { emoji: "📋", title: "Prepare meeting agendas", prompt: "Help me prepare a weekly meeting agenda with objectives, questions, and action items." },
  { emoji: "🔐", title: "Review security updates", prompt: "Summarize important cybersecurity news and practical security recommendations weekly." },
  { emoji: "🎓", title: "Prepare for an exam", prompt: "Create a daily study plan with revision topics, practice questions, and progress checks." },
  { emoji: "🧹", title: "Organize my home tasks", prompt: "Create a practical weekly home-maintenance and cleaning checklist." },
  { emoji: "🎁", title: "Remember special occasions", prompt: "Help me plan reminders and preparation checklists for birthdays and special occasions I provide." },
  { emoji: "🌱", title: "Build a reading habit", prompt: "Send me a daily reading goal and a short reflection question." },
  { emoji: "🧾", title: "Organize bills and deadlines", prompt: "Help me maintain a checklist of bills and deadlines that I enter." },
  { emoji: "🧩", title: "Practice problem-solving", prompt: "Give me one daily reasoning challenge with hints and an explanation." },
  { emoji: "✨", title: "Generate creative ideas", prompt: "Give me a daily creative prompt and practical ideas for developing it." },
];

export default function ScheduledPage({
  onBack,
  onNewTask,
}: Props) {
  const [filter, setFilter] = useState<TaskStatus>("Active");
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [repeat, setRepeat] = useState("Daily");
  const [customSchedule, setCustomSchedule] = useState("");
  const [search, setSearch] = useState("");

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.status === filter),
    [tasks, filter]
  );

  const visibleRecommendations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return RECOMMENDATIONS;

    return RECOMMENDATIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.prompt.toLowerCase().includes(query)
    );
  }, [search]);

  function handleNewTask() {
    if (onNewTask) {
      onNewTask();
    } else {
      openNewTask();
    }
  }

  function openNewTask(recommendation?: Recommendation) {
    setEditingId(null);
    setTitle(recommendation?.title ?? "");
    setPrompt(recommendation?.prompt ?? "");
    setRepeat("Daily");
    setCustomSchedule("");
    setModalVisible(true);
  }

  function openEditTask(task: ScheduledTask) {
    setEditingId(task.id);
    setTitle(task.title);
    setPrompt(task.prompt);
    setRepeat(
      ["Once", "Daily", "Weekly", "Monthly"].includes(task.schedule)
        ? task.schedule
        : "Custom"
    );
    setCustomSchedule(
      ["Once", "Daily", "Weekly", "Monthly"].includes(task.schedule)
        ? ""
        : task.schedule
    );
    setModalVisible(true);
  }

  function saveTask() {
    const taskTitle = title.trim();
    const taskPrompt = prompt.trim();
    const custom = customSchedule.trim();

    if (!taskTitle || !taskPrompt) {
      Alert.alert(
        "Missing details",
        "Enter a task name and instructions."
      );
      return;
    }

    if (repeat === "Custom" && !custom) {
      Alert.alert(
        "Schedule required",
        "Enter your custom schedule."
      );
      return;
    }

    const schedule = repeat === "Custom" ? custom : repeat;

    if (editingId) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId
            ? {
                ...task,
                title: taskTitle,
                prompt: taskPrompt,
                schedule,
              }
            : task
        )
      );
    } else {
      setTasks((previous) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          title: taskTitle,
          prompt: taskPrompt,
          schedule,
          status: "Active",
        },
        ...previous,
      ]);

      setFilter("Active");
    }

    setModalVisible(false);
  }

  function changeStatus(
    task: ScheduledTask,
    status: TaskStatus
  ) {
    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? { ...item, status } : item
      )
    );
  }

  function deleteTask(task: ScheduledTask) {
    Alert.alert("Delete task?", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setTasks((previous) =>
            previous.filter((item) => item.id !== task.id)
          ),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Scheduled</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const selected = filter === item;

          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filter,
                selected && styles.filterSelected,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {visibleTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {filter === "Active"
                ? "No scheduled automations yet"
                : filter === "Paused"
                  ? "No paused tasks"
                  : "No completed tasks yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {visibleTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Pressable
                  style={styles.taskMain}
                  onPress={() => openEditTask(task)}
                >
                  <Text style={styles.taskTitle}>
                    {task.title}
                  </Text>

                  <Text style={styles.taskSchedule}>
                    ◷ {task.schedule}
                  </Text>

                  <Text
                    style={styles.taskPrompt}
                    numberOfLines={2}
                  >
                    {task.prompt}
                  </Text>
                </Pressable>

                <View style={styles.taskActions}>
                  {task.status === "Active" && (
                    <Pressable
                      onPress={() => changeStatus(task, "Paused")}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>Pause</Text>
                    </Pressable>
                  )}

                  {task.status === "Paused" && (
                    <Pressable
                      onPress={() => changeStatus(task, "Active")}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>Resume</Text>
                    </Pressable>
                  )}

                  {task.status !== "Completed" && (
                    <Pressable
                      onPress={() => changeStatus(task, "Completed")}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>Complete</Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => openEditTask(task)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => deleteTask(task)}
                    style={styles.actionButton}
                  >
                    <Text style={[styles.actionText, styles.deleteText]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.recommendedHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <Text style={styles.recommendationCount}>
            {RECOMMENDATIONS.length} ideas
          </Text>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search recommended tasks"
          placeholderTextColor="#888888"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {visibleRecommendations.length === 0 ? (
          <Text style={styles.noResults}>
            No matching recommendations.
          </Text>
        ) : (
          visibleRecommendations.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => openNewTask(item)}
              style={({ pressed }) => [
                styles.recommendationCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.recommendationEmoji}>
                {item.emoji}
              </Text>

              <Text style={styles.recommendationTitle}>
                {item.title}
              </Text>

              {item.featured && (
                <Text style={styles.sparkle}>✦</Text>
              )}
            </Pressable>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <Pressable
        onPress={handleNewTask}
        style={styles.newTaskButton}
        accessibilityRole="button"
        accessibilityLabel="New task"
      >
        <Text style={styles.newTaskText}>＋  New task</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              {editingId ? "Edit task" : "New task"}
            </Text>

            <Pressable onPress={saveTask}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.fieldLabel}>Task name</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What should ModelNow do?"
              placeholderTextColor="#888888"
              style={styles.fieldInput}
            />

            <Text style={styles.fieldLabel}>Instructions</Text>

            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Describe the task you want to automate..."
              placeholderTextColor="#888888"
              style={[styles.fieldInput, styles.promptInput]}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Repeat</Text>

            <View style={styles.repeatOptions}>
              {REPEAT_OPTIONS.map((option) => {
                const selected = repeat === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setRepeat(option)}
                    style={[
                      styles.repeatOption,
                      selected && styles.repeatOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.repeatText,
                        selected && styles.repeatTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {repeat === "Custom" && (
              <TextInput
                value={customSchedule}
                onChangeText={setCustomSchedule}
                placeholder="e.g. Every weekday at 9 AM"
                placeholderTextColor="#888888"
                style={[styles.fieldInput, styles.customScheduleInput]}
              />
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                How scheduling works
              </Text>

              <Text style={styles.infoText}>
                Tasks currently use temporary screen state.
                Persistent storage, automatic execution, and
                notifications require a connected backend scheduler.
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={saveTask}
            >
              <Text style={styles.primaryButtonText}>
                {editingId ? "Save changes" : "Create task"}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  backButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 42,
    lineHeight: 46,
    color: "#111111",
    marginTop: -5,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111111",
  },
  headerSpacer: {
    width: 54,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 16,
  },
  filter: {
    paddingHorizontal: 25,
    paddingVertical: 17,
    borderRadius: 32,
  },
  filterSelected: {
    backgroundColor: "#E7E7E7",
  },
  filterText: {
    color: "#777777",
    fontSize: 17,
    fontWeight: "600",
  },
  filterTextSelected: {
    color: "#111111",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 30,
  },
  emptyState: {
    minHeight: 185,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
  },
  taskList: {
    paddingTop: 10,
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 24,
    padding: 18,
    marginBottom: 4,
  },
  taskMain: {
    gap: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#171717",
  },
  taskSchedule: {
    fontSize: 14,
    color: "#666666",
  },
  taskPrompt: {
    fontSize: 14,
    lineHeight: 20,
    color: "#777777",
  },
  taskActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F3F3F3",
    borderRadius: 18,
  },
  actionText: {
    color: "#303030",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteText: {
    color: "#B42318",
  },
  recommendedHeader: {
    marginTop: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#858585",
    fontWeight: "600",
  },
  recommendationCount: {
    fontSize: 12,
    color: "#999999",
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    color: "#171717",
    marginBottom: 14,
  },
  recommendationCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 18,
    marginBottom: 16,
  },
  cardPressed: {
    backgroundColor: "#F3F3F3",
  },
  recommendationEmoji: {
    width: 54,
    fontSize: 29,
    textAlign: "left",
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: "#171717",
  },
  sparkle: {
    color: "#0878D1",
    fontSize: 27,
    marginLeft: 8,
  },
  noResults: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 15,
    color: "#777777",
  },
  bottomSpace: {
    height: 90,
  },
  newTaskButton: {
    position: "absolute",
    right: 25,
    bottom: 25,
    minHeight: 64,
    paddingHorizontal: 25,
    borderRadius: 36,
    backgroundColor: "#3464E8",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  newTaskText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  modalSafe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  modalHeader: {
    minHeight: 60,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDDDDD",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
  },
  cancelText: {
    fontSize: 15,
    color: "#666666",
  },
  saveText: {
    fontSize: 15,
    color: "#3464E8",
    fontWeight: "700",
  },
  modalContent: {
    padding: 22,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginTop: 18,
    marginBottom: 9,
  },
  fieldInput: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 16,
    fontSize: 15,
    color: "#171717",
  },
  promptInput: {
    minHeight: 125,
  },
  customScheduleInput: {
    marginTop: 14,
  },
  repeatOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  repeatOption: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  repeatOptionSelected: {
    backgroundColor: "#E8EDFF",
    borderColor: "#3464E8",
  },
  repeatText: {
    color: "#555555",
    fontSize: 14,
  },
  repeatTextSelected: {
    color: "#244DC6",
    fontWeight: "700",
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F0F3FC",
    borderRadius: 16,
  },
  infoTitle: {
    color: "#243D85",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 7,
  },
  infoText: {
    color: "#4F5D7B",
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 54,
    backgroundColor: "#3464E8",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
