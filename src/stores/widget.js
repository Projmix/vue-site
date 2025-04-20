import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import axios from "axios"
export const useWidgetStore = defineStore("widget", {
    state: () => ({
      _open: false,
      _id: null,
      _seid: 0,
      _iid: 0,
      _pid: 0,
      _cid: 0,
    }),
    getters: {
      open: s => s._open,
      id: s => s._id,
      seid: s => s._seid,
      iid: s => s._iid,
      pid: s => s._pid,
      cid: s => s._cid,
    },
    actions: {
      openAction(id, type) {
        
        if (id != 0) {
          if (type == 'session') {
            this._id = id;
            this._open = true;
          } else if (type == 'performance') {
            this._pid = id;
            this._open = true;
          } else if (type == 'object') {
            this._cid = id;
            this._open = true;
          }
        }
      },
      openServiceItemAction({ commit }, { id, seid, iid }) {
        if (id) {
          commit('_id', id);
        }
        if (seid && !iid) {
          commit('_seid', seid);
          commit('_iid', 0);
        }
        if (iid && !seid) {
          commit('_iid', iid);
          commit('_seid', 0);
        }
        commit('_open');
      },
      close() {
        this._open = false;
        this._id = null;
        this._pid = 0;
        this._cid = 0;
      },
      idAction({ commit }, value) {
        commit('_id', value);
      },
      seidAction({ commit }, value) {
        commit('_seid', value);
      },
      iidAction({ commit }, value) {
        commit('_iid', value);
      },
      pidAction({ commit }, value) {
        commit('_pid', value);
      },
      cidAction({ commit }, value) {
        commit('_cid', value);
      },
    },
})
