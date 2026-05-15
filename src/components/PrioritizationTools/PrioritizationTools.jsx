import './PrioritizationTools.css';
import EisenhowerMatrix from './EisenhowerMatrix';
import TopThreeFocus from './TopThreeFocus';
import RiceScoring from './RiceScoring';
import { useTasks } from '../../hooks/useTasks';

/**
 * PrioritizationTools - Root component for prioritization features
 * Contains Eisenhower Matrix, Top 3 Focus, and RICE Scoring tools
 */
function PrioritizationTools() {
  const { tasks, updateTask } = useTasks();

  // Filter active tasks only
  const activeTasks = tasks.filter((t) => !t.completedAt);

  // Handle quadrant assignment from Eisenhower Matrix
  const handleQuadrantAssign = async (taskId, quadrant, newPriority) => {
    await updateTask(taskId, {
      eisenhowerQuadrant: quadrant,
      priority: newPriority,
    });
  };

  // Handle RICE score update
  const handleRiceUpdate = async (taskId, riceScores) => {
    await updateTask(taskId, { riceScores });
  };

  return (
    <div className="prioritization-tools">
      <header className="prioritization-tools__header">
        <h2 className="prioritization-tools__title">
          <span className="prioritization-tools__icon" aria-hidden="true">🎯</span>
          Prioritization Tools
        </h2>
        <p className="prioritization-tools__subtitle">
          Organize and prioritize your tasks strategically
        </p>
      </header>

      <div className="prioritization-tools__sections">
        {/* Top 3 Focus Generator */}
        <section className="prioritization-tools__section">
          <TopThreeFocus tasks={activeTasks} />
        </section>

        {/* Eisenhower Matrix */}
        <section className="prioritization-tools__section prioritization-tools__section--full">
          <EisenhowerMatrix
            tasks={activeTasks}
            onQuadrantAssign={handleQuadrantAssign}
          />
        </section>

        {/* RICE Scoring */}
        <section className="prioritization-tools__section">
          <RiceScoring
            tasks={activeTasks}
            onRiceUpdate={handleRiceUpdate}
          />
        </section>
      </div>
    </div>
  );
}

export default PrioritizationTools;
