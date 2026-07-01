import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { TodayScreen } from '@/screens/Today';
import { QueueScreen } from '@/screens/Queue';
import { ScriptReaderScreen } from '@/screens/ScriptReader';
import { VaultImportScreen } from '@/screens/VaultImport';
import { SettingsScreen } from '@/screens/Settings';
import { OnboardingScreen } from '@/screens/Onboarding';
import { EvaluateScreen } from '@/screens/Evaluate';
import { ApplyAssistScreen } from '@/screens/ApplyAssist';
import { FollowupsScreen } from '@/screens/Followups';
import { GeneratePackScreen } from '@/screens/GeneratePack';
import { getConfig } from '@/lib/tauri';

export default function App() {
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getConfig()
      .then(c => {
        setVaultPath(c.vault_path);
        document.documentElement.setAttribute('data-theme', c.theme || 'dark');
      })
      .catch(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout vaultPath={vaultPath} />}>
          <Route
            path="/vault/import"
            element={<VaultImportScreen onImported={setVaultPath} />}
          />
          <Route
            path="/today"
            element={vaultPath ? <TodayScreen /> : <Navigate to="/vault/import" replace />}
          />
          <Route
            path="/queue"
            element={vaultPath ? <QueueScreen /> : <Navigate to="/vault/import" replace />}
          />
          <Route
            path="/script/*"
            element={vaultPath ? <ScriptReaderScreen /> : <Navigate to="/vault/import" replace />}
          />
          <Route
            path="/settings"
            element={
              <SettingsScreen vaultPath={vaultPath} onVaultChange={setVaultPath} />
            }
          />
          <Route path="/onboarding" element={<OnboardingScreen onComplete={setVaultPath} />} />
          <Route path="/evaluate" element={vaultPath ? <EvaluateScreen /> : <Navigate to="/vault/import" replace />} />
          <Route path="/apply/:packPath" element={vaultPath ? <ApplyAssistScreen /> : <Navigate to="/vault/import" replace />} />
          <Route path="/followups" element={vaultPath ? <FollowupsScreen /> : <Navigate to="/vault/import" replace />} />
          <Route path="/generate/:packType" element={vaultPath ? <GeneratePackScreen /> : <Navigate to="/vault/import" replace />} />
          <Route path="/" element={<Navigate to={vaultPath ? '/today' : '/vault/import'} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
