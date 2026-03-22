import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  TouchSensor,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MouseSensor, 
} from "@dnd-kit/core";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Calendar } from "lucide-react";

// Column Definitions — themed
const columns = [
  { id: "Pending", title: "To Do", color: "bg-muted/50 border-border" },
  { id: "In Progress", title: "In Progress", color: "bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10" },
  { id: "Completed", title: "Done", color: "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10" },
  { id: "Overdue", title: "Overdue", color: "bg-rose-500/5 border-rose-500/20 dark:bg-rose-500/10" },
];

const KanbanBoard = ({ tasks, onUpdateStatus, navigate }) => {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    let newStatus = over.id;

    const isColumn = columns.some((col) => col.id === over.id);

    if (!isColumn) {
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return;
      }
    }

    const currentTask = tasks.find((t) => t._id === taskId);
    if (currentTask && currentTask.status !== newStatus) {
      onUpdateStatus(taskId, newStatus);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row h-full gap-6 overflow-x-auto pb-4 items-start">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={tasks.filter((t) => t.status === col.id)}
            navigate={navigate}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <TaskCard task={activeTask} isOverlay />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
};

const KanbanColumn = ({ id, title, tasks, color, navigate }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] w-full lg:w-auto rounded-2xl border ${color} p-4 flex flex-col h-full max-h-[calc(100vh-220px)]`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          {title}
          <span className="bg-card px-2 py-0.5 rounded-full text-xs border border-border shadow-sm text-muted-foreground">
            {tasks.length}
          </span>
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {tasks.map((task) => (
          <SortableTaskItem key={task._id} task={task} navigate={navigate} />
        ))}
        {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-xs italic">
                Drop here
            </div>
        )}
      </div>
    </div>
  );
};

const SortableTaskItem = ({ task, navigate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={() => navigate(`/tasks/${task._id}`)} />
    </div>
  );
};

const TaskCard = ({ task, onClick, isOverlay }) => {
  const getPriorityColor = (p) => {
    if (p === "High") return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (p === "Medium") return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-card p-4 rounded-xl border border-border shadow-sm 
        group relative transition-all
        ${!isOverlay ? "hover:shadow-md hover:-translate-y-1 cursor-grab active:cursor-grabbing" : "cursor-grabbing shadow-2xl scale-105 rotate-2 ring-2 ring-primary ring-offset-2 ring-offset-background"}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
        {task.deadline && (
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              new Date(task.deadline) < new Date()
                ? "text-rose-500"
                : "text-muted-foreground"
            }`}
          >
            <Calendar size={12} />
            {new Date(task.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      <h4 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">
        {task.title}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
            {task.assignedManager?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {task.assignedManager?.username}
          </span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded border border-border truncate max-w-[80px]">
          {task.department?.name || "General"}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;