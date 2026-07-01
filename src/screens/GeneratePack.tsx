import { useParams } from 'react-router-dom';
import { getApiKey } from '@/lib/vault-write';

const PACK_INFO: Record<string, { title: string; module: string }> = {
  apply: { title: 'Apply script pack', module: 'apply-script-pack' },
  outreach: { title: 'Outreach script pack', module: 'outreach-script-pack' },
  interview: { title: 'Interview script pack', module: 'interview-script-prep' },
  followup: { title: 'Follow-up script pack', module: 'followup-script-pack' },
  negotiate: { title: 'Negotiation script pack', module: 'negotiation-script-pack' },
};

export function GeneratePackScreen() {
  const { packType } = useParams();
  const info = PACK_INFO[packType || ''] || { title: 'Generate pack', module: 'unknown' };

  const generate = async () => {
    const key = await getApiKey('openai');
    alert(
      key
        ? `Phase 3: would assemble charter + ${info.module} + modes with your BYOK key and write to interview-prep/. Review before Send.`
        : `Add an API key in Settings → Evaluate, or use Cursor/CLI with /graduates-guide against the same vault.`,
    );
  };

  return (
    <>
      <h1 className="page-title">{info.title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        <strong>Phase 3 preview.</strong> In-app pack generation is not wired yet — use the bundled engine / CLI. Output must pass graduates-guide-verify before you send anything.
      </p>
      <section className="card">
        <p>Module: <code>{info.module}</code></p>
        <button type="button" className="btn btn-primary" onClick={generate}>
          Generate (BYOK)
        </button>
        <p style={{ fontSize: '0.8rem', marginTop: 12, color: 'var(--text-muted)' }}>
          PDF export uses bundled generate-pdf.mjs + study-guide-template.html (Phase 3 complete path).
        </p>
      </section>
    </>
  );
}
