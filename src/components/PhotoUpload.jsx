import { useId, useState } from 'react';
import Button from './Button.jsx';
import { fileToBase64 } from '../utils/helpers.js';

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap; Media stores Base64 inline.

export default function PhotoUpload({ value, onChange, label = 'Photo' }) {
  const id = useId();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image is too large. Use a file under 2 MB.');
      return;
    }
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      onChange?.(base64);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="photo-upload" onClick={() => document.getElementById(id)?.click()}>
        {value ? (
          <div className="photo-upload__preview">
            <img src={value} alt="Selected preview" />
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--color-muted)' }}>
            Click to choose an image. It will be encoded to Base64 and stored
            in the <code>Media.ImageAsText</code> column.
          </p>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="button-row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(id)?.click();
            }}
          >
            {busy ? 'Reading…' : 'Choose file'}
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.('');
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
