import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ACCEPTED_TYPES, CATEGORIES, MAX_UPLOAD_MB } from '../utils/constants';
import * as api from '../services/api';

export default function Upload() {
  const toast = useToast();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ caption: '', description: '', category: '' });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setErrors((e) => ({ ...e, image: 'Upload a JPEG, PNG or WebP image.' }));
      return;
    }
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: `Images must be under ${MAX_UPLOAD_MB} MB.` }));
      return;
    }
    setErrors((e) => ({ ...e, image: undefined }));
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreview('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, '');
    if (!t) return;
    if (tags.includes(t)) return setTagInput('');
    if (tags.length >= 8) return setErrors((e) => ({ ...e, tags: 'You can add up to 8 tags.' }));
    setErrors((e) => ({ ...e, tags: undefined }));
    setTags([...tags, t]);
    setTagInput('');
  };

  const onTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!file) found.image = 'Choose a photograph to upload.';
    if (!form.caption.trim()) found.caption = 'Add a caption.';
    else if (form.caption.length > 100) found.caption = 'Keep the caption under 100 characters.';
    if (form.description.length > 500) found.description = 'Keep the description under 500 characters.';
    if (!form.category) found.category = 'Pick a category.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const pending = tagInput.trim() ? [...new Set([...tags, tagInput.trim().toLowerCase().replace(/^#/, '')])].slice(0, 8) : tags;
      const photo = await api.createPhoto({
        file,
        caption: form.caption,
        description: form.description,
        category: form.category,
        tags: pending,
      });
      toast.success('Your photograph is live.');
      navigate(`/photo/${photo._id}`);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Upload a photograph</h1>
      <p className="mt-2 font-serif text-xl text-mute">Share a frame you are proud of.</p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          {preview ? (
            <div className="relative overflow-hidden rounded-3xl bg-sand">
              <img src={preview} alt="Preview of your photograph" className="max-h-[70vh] w-full object-contain" />
              <button type="button" onClick={clearFile} aria-label="Remove selected photograph" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/95 shadow hover:bg-surface">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
              className={`flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 text-center transition-colors ${dragging ? 'border-cyano bg-cyano-soft' : errors.image ? 'border-danger bg-danger-soft/40' : 'border-line bg-surface/50 hover:border-ink'}`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-sand"><ImagePlus size={24} /></span>
              <span className="text-lg font-semibold">Drop a photograph here</span>
              <span className="text-sm text-mute">or click to browse. JPEG, PNG or WebP, up to {MAX_UPLOAD_MB} MB.</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Choose photograph" />
          {errors.image && <p role="alert" className="error-text">{errors.image}</p>}
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="caption" className="label">Caption</label>
            <input id="caption" value={form.caption} onChange={set('caption')} maxLength={100} aria-invalid={!!errors.caption} className={`field ${errors.caption ? 'field-error' : ''}`} placeholder="Give it a title" />
            {errors.caption && <p className="error-text">{errors.caption}</p>}
          </div>
          <div>
            <label htmlFor="description" className="label">Description <span className="font-normal text-mute">(optional)</span></label>
            <textarea id="description" rows={4} value={form.description} onChange={set('description')} maxLength={500} aria-invalid={!!errors.description} className={`field resize-y ${errors.description ? 'field-error' : ''}`} placeholder="Where was it taken? What was the story?" />
            <div className="mt-1 flex justify-between text-xs text-mute">
              <span>{errors.description && <span className="text-danger">{errors.description}</span>}</span>
              <span>{form.description.length}/500</span>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" value={form.category} onChange={set('category')} aria-invalid={!!errors.category} className={`field ${errors.category ? 'field-error' : ''}`}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="error-text">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="tags" className="label">Tags <span className="font-normal text-mute">(press Enter or comma to add)</span></label>
            <div className="field flex flex-wrap items-center gap-2 !py-2">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-cyano-soft py-1 pl-3 pr-1.5 text-sm text-cyano-text">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="rounded-full p-0.5 hover:bg-cyano/10"><X size={14} /></button>
                </span>
              ))}
              <input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey} onBlur={() => addTag(tagInput)} className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none" placeholder={tags.length ? '' : 'sunrise, mist, hills'} />
            </div>
            {errors.tags && <p className="error-text">{errors.tags}</p>}
          </div>
          <button type="submit" disabled={busy} className="btn btn-accent w-full !py-3">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? 'Uploading' : 'Upload photograph'}
          </button>
        </div>
      </form>
    </div>
  );
}
