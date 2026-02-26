'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  Image,
  FileSpreadsheet,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  Plus,
  Filter,
  X,
  File,
  Calendar,
  PawPrint,
  User,
  Tag,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Types ──

interface Document {
  id: string;
  name: string;
  type: 'xray' | 'lab_report' | 'consent_form' | 'certificate' | 'photo' | 'invoice' | 'referral' | 'other';
  fileType: 'pdf' | 'image' | 'doc';
  size: string;
  patientName: string;
  patientId: string;
  clientName: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  description: string;
  thumbnailColor: string;
}

// ── Mock Data ──

const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc-1', name: 'Max_Hip_Radiograph_Lateral.dcm', type: 'xray', fileType: 'image', size: '4.2 MB', patientName: 'Max', patientId: '30000000-0000-0000-0000-000000000001', clientName: 'Michael Johnson', uploadedBy: 'Dr. Carter', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), tags: ['orthopedic', 'hip', 'pre-op'], description: 'Right hip VD and lateral views — pre-surgical planning for TPLO', thumbnailColor: '#6366f1' },
  { id: 'doc-2', name: 'Max_Hip_Radiograph_VD.dcm', type: 'xray', fileType: 'image', size: '3.8 MB', patientName: 'Max', patientId: '30000000-0000-0000-0000-000000000001', clientName: 'Michael Johnson', uploadedBy: 'Dr. Carter', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), tags: ['orthopedic', 'hip', 'pre-op'], description: 'Right hip VD view — OA changes Grade 2', thumbnailColor: '#6366f1' },
  { id: 'doc-3', name: 'Bella_CBC_Results_Feb2026.pdf', type: 'lab_report', fileType: 'pdf', size: '245 KB', patientName: 'Bella', patientId: '30000000-0000-0000-0000-000000000003', clientName: 'Amanda Williams', uploadedBy: 'Lab Auto-Import', uploadedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['bloodwork', 'CBC', 'pre-dental'], description: 'Pre-anesthetic CBC panel — all values WNL', thumbnailColor: '#10b981' },
  { id: 'doc-4', name: 'Cleo_Thyroid_Panel.pdf', type: 'lab_report', fileType: 'pdf', size: '198 KB', patientName: 'Cleo', patientId: '30000000-0000-0000-0000-000000000007', clientName: 'Karen Thomas', uploadedBy: 'Lab Auto-Import', uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(), tags: ['thyroid', 'endocrine', 'senior'], description: 'T4 elevated — hyperthyroidism confirmed. SDMA borderline.', thumbnailColor: '#f59e0b' },
  { id: 'doc-5', name: 'Surgery_Consent_Max_Johnson.pdf', type: 'consent_form', fileType: 'pdf', size: '156 KB', patientName: 'Max', patientId: '30000000-0000-0000-0000-000000000001', clientName: 'Michael Johnson', uploadedBy: 'Lisa R.', uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(), tags: ['consent', 'surgery', 'signed'], description: 'Anesthesia and surgical consent form — signed by owner', thumbnailColor: '#8b5cf6' },
  { id: 'doc-6', name: 'Cooper_Vaccination_Certificate.pdf', type: 'certificate', fileType: 'pdf', size: '89 KB', patientName: 'Cooper', patientId: '30000000-0000-0000-0000-000000000005', clientName: 'Sarah Anderson', uploadedBy: 'Sarah Tech', uploadedAt: new Date(Date.now() - 7 * 86400000).toISOString(), tags: ['vaccination', 'rabies', 'certificate'], description: 'Rabies vaccination certificate — valid until Feb 2027', thumbnailColor: '#ec4899' },
  { id: 'doc-7', name: 'Thor_Chest_Xray.dcm', type: 'xray', fileType: 'image', size: '5.1 MB', patientName: 'Thor', patientId: '30000000-0000-0000-0000-000000000009', clientName: 'Emily Chen', uploadedBy: 'Dr. Park', uploadedAt: new Date(Date.now() - 14 * 86400000).toISOString(), tags: ['thoracic', 'cardiac', 'screening'], description: 'Thoracic 3-view series — mild cardiomegaly noted, recommend echo', thumbnailColor: '#ef4444' },
  { id: 'doc-8', name: 'Milo_Skin_Photo_1.jpg', type: 'photo', fileType: 'image', size: '1.8 MB', patientName: 'Milo', patientId: '30000000-0000-0000-0000-000000000012', clientName: 'Tom Harris', uploadedBy: 'Dr. Carter', uploadedAt: new Date().toISOString(), tags: ['dermatology', 'skin fold', 'follow-up'], description: 'Skin fold dermatitis progression photo — day 7 of treatment', thumbnailColor: '#f97316' },
  { id: 'doc-9', name: 'Referral_Letter_Bella_Ortho.pdf', type: 'referral', fileType: 'pdf', size: '312 KB', patientName: 'Bella', patientId: '30000000-0000-0000-0000-000000000003', clientName: 'Amanda Williams', uploadedBy: 'Dr. Carter', uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(), tags: ['referral', 'orthopedic', 'specialist'], description: 'Referral to Springfield Orthopedic Specialists for bilateral hip evaluation', thumbnailColor: '#0ea5e9' },
  { id: 'doc-10', name: 'Luna_Dental_Photos.zip', type: 'photo', fileType: 'image', size: '8.4 MB', patientName: 'Luna', patientId: '30000000-0000-0000-0000-000000000002', clientName: 'Michael Johnson', uploadedBy: 'Dr. Park', uploadedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['dental', 'before-after', 'cleaning'], description: 'Pre and post-dental cleaning photos — 4 images', thumbnailColor: '#14b8a6' },
];

// ── Styles ──

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  xray: { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', label: 'X-Ray', icon: Image },
  lab_report: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Lab Report', icon: FileSpreadsheet },
  consent_form: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', label: 'Consent', icon: FileText },
  certificate: { bg: 'bg-pink-100 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-400', label: 'Certificate', icon: CheckCircle2 },
  photo: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', label: 'Photo', icon: Image },
  invoice: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Invoice', icon: FileText },
  referral: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', label: 'Referral', icon: FileText },
  other: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Other', icon: File },
};

export default function DocumentsPage() {
  const [documents] = useState(MOCK_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const filtered = documents.filter((doc) => {
    if (typeFilter && doc.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.patientName.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q) || doc.tags.some((t) => t.includes(q));
    }
    return true;
  });

  const typeCounts = documents.reduce<Record<string, number>>((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {});
  const totalSize = documents.reduce((sum, d) => {
    const match = d.size.match(/([\d.]+)\s*(KB|MB|GB)/);
    if (!match) return sum;
    const val = parseFloat(match[1]);
    if (match[2] === 'GB') return sum + val * 1000;
    if (match[2] === 'MB') return sum + val;
    return sum + val / 1000;
  }, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Documents</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Document & Imaging Vault</h1>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
          <Upload className="h-4 w-4" /> Upload Files
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Files', value: documents.length, icon: FolderOpen, gradient: 'from-blue-500 to-blue-600', accent: 'text-blue-600' },
          { label: 'X-Rays', value: typeCounts['xray'] || 0, icon: Image, gradient: 'from-indigo-500 to-indigo-600', accent: 'text-indigo-600' },
          { label: 'Lab Reports', value: typeCounts['lab_report'] || 0, icon: FileSpreadsheet, gradient: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-600' },
          { label: 'Storage Used', value: `${totalSize.toFixed(1)} MB`, icon: File, gradient: 'from-purple-500 to-purple-600', accent: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', stat.gradient)} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.accent)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, patients, tags..."
            className="h-10 w-full rounded-xl border border-border/40 bg-muted/20 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {Object.entries(TYPE_STYLES).filter(([key]) => typeCounts[key]).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? null : key)}
              className={cn('rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all', typeFilter === key ? cn(style.bg, style.text) : 'bg-muted text-muted-foreground hover:bg-muted/80')}
            >
              {style.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-border/40 p-0.5">
          <button onClick={() => setViewMode('grid')} className={cn('rounded-md px-2 py-1', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={cn('rounded-md px-2 py-1', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.5" rx="1" /><rect x="1" y="6.75" width="14" height="2.5" rx="1" /><rect x="1" y="11.5" width="14" height="2.5" rx="1" /></svg>
          </button>
        </div>
      </div>

      {/* Document Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc, i) => {
            const typeStyle = TYPE_STYLES[doc.type];
            const TypeIcon = typeStyle.icon;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                onClick={() => setPreviewDoc(doc)}
              >
                {/* Thumbnail */}
                <div className="relative flex h-32 items-center justify-center" style={{ backgroundColor: doc.thumbnailColor + '15' }}>
                  <TypeIcon className="h-12 w-12" style={{ color: doc.thumbnailColor + '80' }} />
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); toast.success('Downloaded'); }} className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-sm hover:bg-black/60">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className={cn('absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold', typeStyle.bg, typeStyle.text)}>
                    {typeStyle.label}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-xs font-semibold">{doc.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{doc.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <PawPrint className="h-3 w-3" /> {doc.patientName}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="divide-y divide-border/30">
            {filtered.map((doc) => {
              const typeStyle = TYPE_STYLES[doc.type];
              const TypeIcon = typeStyle.icon;
              return (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-all hover:bg-muted/20"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: doc.thumbnailColor + '15' }}>
                    <TypeIcon className="h-5 w-5" style={{ color: doc.thumbnailColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{doc.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{doc.description}</p>
                  </div>
                  <div className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
                    <PawPrint className="h-3 w-3" /> {doc.patientName}
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold', typeStyle.bg, typeStyle.text)}>{typeStyle.label}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{doc.size}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(doc.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
            >
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Preview area */}
              <div className="flex h-64 items-center justify-center" style={{ backgroundColor: previewDoc.thumbnailColor + '10' }}>
                {previewDoc.fileType === 'image' ? (
                  <div className="text-center">
                    <Image className="mx-auto mb-2 h-16 w-16" style={{ color: previewDoc.thumbnailColor + '60' }} />
                    <p className="text-sm font-medium text-muted-foreground">Image Preview</p>
                    <p className="text-[10px] text-muted-foreground">{previewDoc.size} · {previewDoc.fileType.toUpperCase()}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto mb-2 h-16 w-16" style={{ color: previewDoc.thumbnailColor + '60' }} />
                    <p className="text-sm font-medium text-muted-foreground">PDF Document</p>
                    <p className="text-[10px] text-muted-foreground">{previewDoc.size}</p>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-semibold">{previewDoc.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{previewDoc.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PawPrint className="h-3.5 w-3.5" /> <span className="font-medium text-foreground">{previewDoc.patientName}</span> ({previewDoc.clientName})
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Uploaded by {previewDoc.uploadedBy}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(previewDoc.uploadedAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" /> {previewDoc.tags.join(', ')}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => toast.success('Downloaded')} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/40 px-4 text-sm font-medium text-muted-foreground hover:bg-muted">
                    <Eye className="h-3.5 w-3.5" /> Open Full
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
