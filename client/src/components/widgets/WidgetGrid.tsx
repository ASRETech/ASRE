/**
 * WidgetGrid — drag-and-drop widget layout for Execution HQ
 *
 * Uses @dnd-kit/sortable for reordering.
 * Layout preference saved to localStorage under key 'asre_widget_order'.
 *
 * Usage:
 *   <WidgetGrid widgets={[...]} />
 */

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
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  /** Grid column span: 1 = half width, 2 = full width */
  span?: 1 | 2;
}

const STORAGE_KEY = 'asre_widget_order';

function loadOrder(defaultIds: string[]): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultIds;
    const parsed: string[] = JSON.parse(saved);
    // Merge: keep saved order but add any new widgets at the end
    const merged = parsed.filter(id => defaultIds.includes(id));
    const newIds = defaultIds.filter(id => !merged.includes(id));
    return [...merged, ...newIds];
  } catch {
    return defaultIds;
  }
}

function saveOrder(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

// ── Sortable widget wrapper ──
function SortableWidget({
  id,
  title,
  children,
  span = 1,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: span === 2 ? 'span 2' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border/60 bg-card p-4 flex flex-col min-h-[180px]"
    >
      {/* Drag handle — hidden until hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

// ── Main WidgetGrid ──
export function WidgetGrid({ widgets }: { widgets: WidgetConfig[] }) {
  const defaultIds = widgets.map(w => w.id);
  const [order, setOrder] = useState<string[]>(() => loadOrder(defaultIds));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder(prev => {
        const oldIdx = prev.indexOf(String(active.id));
        const newIdx = prev.indexOf(String(over.id));
        const next = arrayMove(prev, oldIdx, newIdx);
        saveOrder(next);
        return next;
      });
    }
  }, []);

  // Build a map for quick lookup
  const widgetMap = Object.fromEntries(widgets.map(w => [w.id, w]));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 relative">
          {order.map(id => {
            const widget = widgetMap[id];
            if (!widget) return null;
            return (
              <div
                key={id}
                className="group relative"
                style={{ gridColumn: widget.span === 2 ? 'span 2' : undefined }}
              >
                <SortableWidget id={id} title={widget.title} span={widget.span}>
                  {widget.component}
                </SortableWidget>
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
