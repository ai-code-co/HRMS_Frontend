<script setup lang="ts">
import { computed, ref } from 'vue';
import { useInventoryStore } from '../../stores/inventory';

const props = defineProps<{
  documents?: Record<string, { name: string; url: string }>;
  deviceId?: string;
}>();

const store = useInventoryStore();
const toast = useToast();

const documentTypes = ['Photo', 'Warranty', 'Invoice'] as const;

const DOC_TYPE_TO_KEY: Record<string, string> = {
  Photo: 'photo',
  Warranty: 'warranty_doc',
  Invoice: 'invoice_doc',
};

/** One computed list so template doesn't repeat lookups */
const documentList = computed(() =>
  documentTypes.map((type) => ({
    type,
    key: DOC_TYPE_TO_KEY[type] ?? type.toLowerCase(),
    doc: props.documents?.[DOC_TYPE_TO_KEY[type] ?? type.toLowerCase()] ?? null,
  }))
);

function getExtensionFromUrl(url: string): string {
  const path = url.split('?')[0];
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return ext && /^[a-z0-9]+$/i.test(ext) ? ext : 'webp';
}

const downloadingType = ref<string | null>(null);
const deleteDocumentConfirmOpen = ref(false);
const documentToDelete = ref<{ type: string; key: string } | null>(null);
const deletingDocKey = ref<string | null>(null);

function openDeleteConfirm(entry: { type: string; key: string }) {
  documentToDelete.value = entry;
  deleteDocumentConfirmOpen.value = true;
}

async function confirmDeleteDocument() {
  if (!props.deviceId || !documentToDelete.value) return;
  const docKey = documentToDelete.value.key;
  deletingDocKey.value = docKey;
  try {
    const success = await store.deleteDocument(props.deviceId, docKey);
    if (success) {
      deleteDocumentConfirmOpen.value = false;
      documentToDelete.value = null;
    }
  } finally {
    deletingDocKey.value = null;
  }
}

async function downloadFile(type: string) {
  const entry = documentList.value.find((e) => e.type === type);
  const doc = entry?.doc ?? null;
  if (!doc?.url) return;

  downloadingType.value = type;
  let objectUrl: string | null = null;

  try {
    const res = await fetch(doc.url, { mode: 'cors' });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    objectUrl = URL.createObjectURL(blob);
    const ext = getExtensionFromUrl(doc.url);
    const filename = doc.name.includes('.') ? doc.name : `${doc.name}.${ext}`;

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Download error:', e);
    toast.add({
      title: 'Download failed',
      description: 'Could not download the file. Try opening the link in a new tab.',
      color: 'error',
    });
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    downloadingType.value = null;
  }
}

function getMenuItems(entry: { type: string; key: string; doc: { name: string; url: string } | null }) {
  if (!entry.doc) return [];
  const items: { label: string; onSelect: () => void; color?: 'error' }[] = [
    { label: 'Download', onSelect: () => downloadFile(entry.type) },
  ];
  if (props.deviceId) {
    items.push({ label: 'Delete', onSelect: () => openDeleteConfirm(entry), color: 'error' });
  }
  return [items];
}
</script>

<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 shrink-0 w-full xl:w-72">
    <h4 class="text-base font-black text-slate-800 tracking-tight">Documents</h4>
    <div class="space-y-4">
      <div
        v-for="(entry, i) in documentList"
        :key="entry.type"
        class="flex items-center justify-between p-2 rounded-xl group hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center gap-4">
          <span
            class="w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border"
            :class="entry.doc ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'"
          >
            {{ i + 1 }}
          </span>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-600">{{ entry.type }}</span>
            <span v-if="entry.doc" class="text-[10px] text-emerald-500 font-medium truncate max-w-[120px]">
              {{ entry.doc.name }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <UDropdownMenu
            v-if="entry.doc"
            :items="getMenuItems(entry)"
            :ui="{ content: 'w-40' }"
          >
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              size="xs"
              color="neutral"
              variant="ghost"
              class="rounded-full shrink-0"
              :disabled="deletingDocKey !== null"
              aria-label="Document actions"
            />
          </UDropdownMenu>
          <div v-else class="p-1.5 text-slate-300">
            <UIcon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>

    <UIConfirmDialog
      v-model:open="deleteDocumentConfirmOpen"
      title="Delete Document"
      :message="documentToDelete ? `Are you sure you want to remove the ${documentToDelete.type} document? This action cannot be undone.` : 'Remove this document?'"
      confirm-label="Delete"
      cancel-label="Cancel"
      confirm-color="error"
      icon="i-lucide-alert-triangle"
      icon-bg="bg-red-100"
      icon-color="text-red-600"
      :loading="deletingDocKey !== null"
      @confirm="confirmDeleteDocument"
    />
  </div>
</template>
