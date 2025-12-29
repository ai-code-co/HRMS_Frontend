<script setup lang="ts">
import { Upload, DownloadCloud } from 'lucide-vue-next';

const labelStyles = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";
const inputStyles = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all";
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
      <h3 class="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
        Upload <span class="text-indigo-600">New Documents</span>
      </h3>
      
      <div class="bg-[#9B67E1] text-white p-4 rounded-xl text-xs font-bold tracking-wide">
         You can upload multiple documents together
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div class="space-y-4">
            <div>
              <label :class="labelStyles">Document Type</label>
              <select :class="inputStyles">
                 <option>--Select document--</option>
                 <option>Photo</option>
                 <option>Warranty</option>
                 <option>Invoice</option>
              </select>
            </div>
            <div class="pt-2">
              <label :class="labelStyles">Upload Document</label>
              <div class="hidden">
                 <input type="file" id="doc-upload" />
              </div>
            </div>
         </div>
         
         <div class="md:col-span-2 h-48 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center p-6 hover:bg-slate-50 hover:border-indigo-200 transition-all cursor-pointer group">
            <Upload :size="40" class="text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" />
            <p class="text-xs font-bold text-slate-500 group-hover:text-slate-700">Drop a document here or click to select file to upload</p>
         </div>
      </div>

      <div class="pt-8">
         <h4 class="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4">Document <span class="text-slate-800">Directory</span></h4>
         <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100">
                 <th class="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document View</th>
                 <th class="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                 <td colspan="2" class="py-8 text-center text-xs font-bold text-slate-300 italic">No Available Data</td>
              </tr>
            </tbody>
         </table>
      </div>
    </div>

    <div class="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
       <h3 class="text-lg font-black text-slate-800 tracking-tight">Documents</h3>
       <div class="space-y-4">
          <div v-for="(doc, i) in ['Photo', 'Warranty', 'Invoice']" :key="doc" class="flex items-center justify-between p-2 rounded-xl group hover:bg-slate-50 transition-colors">
             <div class="flex items-center gap-4">
                <span class="w-6 h-6 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 flex items-center justify-center border border-slate-100">{{ i+1 }}</span>
                <span class="text-xs font-bold text-slate-600">{{ doc }}</span>
             </div>
             <button class="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><DownloadCloud :size="16" /></button>
          </div>
       </div>
    </div>
  </div>
</template>