import { Navigate, Route, Routes } from 'react-router-dom';
import { ExamPage } from './Exams';
import { SessionPage } from './LearnerSession';
import { LearnerDashboard } from './LearnerDashboard';
import { DiagnosticPage } from './study-diagnostic';

export function LearnerPilot({ token, name }: { token: string; name: string }) {
  return (
    <Routes>
      <Route index element={<LearnerDashboard token={token} name={name} view="home" />} />
      <Route path="planning" element={<LearnerDashboard token={token} name={name} view="planning" />} />
      <Route path="resultats" element={<LearnerDashboard token={token} name={name} view="results" />} />
      <Route path="messages" element={<LearnerDashboard token={token} name={name} view="messages" />} />
      <Route path="seance/:sessionId" element={<SessionPage token={token} />} />
      <Route path="diagnostic" element={<DiagnosticPage token={token} />} />
      <Route path="evaluation/:enrollmentId/:kind" element={<ExamPage token={token} />} />
      <Route path="*" element={<Navigate to="/espace" replace />} />
    </Routes>
  );
}
