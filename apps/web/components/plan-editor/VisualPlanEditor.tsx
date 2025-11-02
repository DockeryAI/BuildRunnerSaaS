'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  Bars3Icon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { format, differenceInDays, addDays } from 'date-fns';

/**
 * Project Plan Data Structures
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[]; // IDs of dependent milestones
  assignee?: string;
  tasks: Task[];
  isExpanded: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  assignee?: string;
}

interface VisualPlanEditorProps {
  initialMilestones: Milestone[];
  onMilestoneUpdate: (milestones: Milestone[]) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  onMilestoneDelete?: (milestoneId: string) => void;
  onTaskAdd?: (milestoneId: string) => void;
}

/**
 * Sortable Milestone Row Component
 */
interface SortableMilestoneProps {
  milestone: Milestone;
  index: number;
  totalMilestones: number;
  projectStartDate: Date;
  projectDuration: number;
  onToggleExpand: (id: string) => void;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (id: string) => void;
  onTaskAdd?: (milestoneId: string) => void;
  onInlineEdit?: (milestoneId: string, field: string, value: string) => void;
}

function SortableMilestone({
  milestone,
  index,
  totalMilestones,
  projectStartDate,
  projectDuration,
  onToggleExpand,
  onEdit,
  onDelete,
  onTaskAdd,
  onInlineEdit,
}: SortableMilestoneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(milestone.title);

  const durationDays = differenceInDays(milestone.endDate, milestone.startDate) + 1;
  const startOffset = differenceInDays(milestone.startDate, projectStartDate);
  const ganttPosition = (startOffset / projectDuration) * 100;
  const ganttWidth = (durationDays / projectDuration) * 100;

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Not Started';
    }
  };

  const handleTitleSave = () => {
    if (onInlineEdit && editedTitle.trim() !== milestone.title) {
      onInlineEdit(milestone.id, 'title', editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-md transition-shadow"
    >
      {/* Milestone Header */}
      <div className="flex items-center p-4 gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          title="Drag to reorder"
        >
          <Bars3Icon className="w-5 h-5 text-gray-400" />
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => onToggleExpand(milestone.id)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {milestone.isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Milestone Number */}
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
          {index + 1}
        </div>

        {/* Milestone Title (Inline Editable) */}
        <div className="flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditedTitle(milestone.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-opacity"
                title="Edit title"
              >
                <PencilIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-600 mt-0.5">{milestone.description}</p>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(milestone.status)}`}>
          {getStatusText(milestone.status)}
        </span>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{format(milestone.startDate, 'MMM d')} - {format(milestone.endDate, 'MMM d')}</span>
          <span className="text-gray-400">({durationDays}d)</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(milestone)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Edit milestone"
            >
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(milestone.id)}
              className="p-2 hover:bg-red-50 rounded transition-colors"
              title="Delete milestone"
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Gantt Bar */}
      <div className="px-4 pb-2">
        <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
          <div
            className={`absolute h-full ${getStatusColor(milestone.status)} opacity-80 rounded transition-all`}
            style={{
              left: `${ganttPosition}%`,
              width: `${ganttWidth}%`,
            }}
          >
            <div className="h-full flex items-center justify-center text-white text-xs font-semibold">
              {durationDays}d
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details (Tasks) */}
      {milestone.isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Tasks ({milestone.tasks.length})</h4>
            {onTaskAdd && (
              <button
                onClick={() => onTaskAdd(milestone.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="w-3 h-3" />
                Add Task
              </button>
            )}
          </div>

          <div className="space-y-2">
            {milestone.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <CheckCircleIcon className={`w-5 h-5 ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-gray-600 mt-0.5">{task.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <ClockIcon className="w-3 h-3" />
                  {task.estimatedHours}h
                </div>
                {task.assignee && (
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {task.assignee}
                  </div>
                )}
              </div>
            ))}

            {milestone.tasks.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                No tasks yet. Click "Add Task" to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * VisualPlanEditor - Main component for visual project plan editing
 *
 * Features:
 * - Gantt timeline visualization
 * - Drag-to-reorder milestones
 * - Inline editing of milestone titles
 * - Expandable milestone details with tasks
 * - Status tracking and visual indicators
 * - Date range management
 *
 * Best Practices:
 * - Uses @dnd-kit for accessible drag-and-drop
 * - TypeScript strict typing
 * - Follows BuildRunner coding standards
 * - Responsive and keyboard accessible
 */
export function VisualPlanEditor({
  initialMilestones,
  onMilestoneUpdate,
  onMilestoneEdit,
  onMilestoneDelete,
  onTaskAdd,
}: VisualPlanEditorProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate project timeline
  const projectStartDate = milestones.reduce(
    (earliest, m) => (m.startDate < earliest ? m.startDate : earliest),
    milestones[0]?.startDate || new Date()
  );

  const projectEndDate = milestones.reduce(
    (latest, m) => (m.endDate > latest ? m.endDate : latest),
    milestones[0]?.endDate || new Date()
  );

  const projectDuration = differenceInDays(projectEndDate, projectStartDate) + 1;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMilestones((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        onMilestoneUpdate(reordered);
        return reordered;
      });
    }
  }, [onMilestoneUpdate]);

  const handleToggleExpand = useCallback((id: string) => {
    setMilestones((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  }, []);

  const handleInlineEdit = useCallback((milestoneId: string, field: string, value: string) => {
    setMilestones((items) => {
      const updated = items.map((item) =>
        item.id === milestoneId ? { ...item, [field]: value } : item
      );
      onMilestoneUpdate(updated);
      return updated;
    });
  }, [onMilestoneUpdate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Visual Plan Editor</h2>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Gantt View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Project Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Milestones</div>
            <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Duration</div>
            <div className="text-2xl font-bold text-blue-600">{projectDuration}d</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {milestones.filter((m) => m.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-yellow-600">
              {milestones.filter((m) => m.status === 'in_progress').length}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Header (Gantt mode only) */}
      {viewMode === 'gantt' && projectDuration > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Project Timeline</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{format(projectStartDate, 'MMM d, yyyy')}</span>
            <span>{format(projectEndDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={milestones.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <SortableMilestone
                key={milestone.id}
                milestone={milestone}
                index={index}
                totalMilestones={milestones.length}
                projectStartDate={projectStartDate}
                projectDuration={projectDuration}
                onToggleExpand={handleToggleExpand}
                onEdit={onMilestoneEdit}
                onDelete={onMilestoneDelete}
                onTaskAdd={onTaskAdd}
                onInlineEdit={handleInlineEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {milestones.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No milestones yet</p>
          <p className="text-sm">Generate a project plan from your PRD to get started</p>
        </div>
      )}
    </div>
  );
}
