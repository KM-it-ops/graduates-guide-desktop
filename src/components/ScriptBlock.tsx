import { writeText } from '@tauri-apps/plugin-clipboard-manager';

interface Props {
  text: string;
  label?: string;
  onCopied: () => void;
}

export function ScriptBlock({ text, label = 'Script', onCopied }: Props) {
  const copy = async () => {
    try {
      await writeText(text);
      onCopied();
    } catch {
      await navigator.clipboard.writeText(text);
      onCopied();
    }
  };

  return (
    <div className="script-block">
      <span className="script-label">{label}</span>
      <button type="button" className="btn btn-sm copy-btn" onClick={copy}>
        Copy
      </button>
      <pre>{text}</pre>
    </div>
  );
}
