<template>
  <div class="widget-mask">
    <div class="widget-wrapper">
      <div class="widget-container">
        <iframe id="widget" class="frame-center" :src="getFrameUrl(sid, seid, iid, pid, cid)"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { useCookies  } from 'vue3-cookies';
import { computed } from 'vue'
import { useWidgetStore } from '../stores/widget'
// import configEx from '../boot/config';


export default {
  model: {
    event: 'change',
  },
  name: 'WidgetFrame',
  emits: ['close'],
  props: {
    sid: {
      type: Number,
      required: false,
    },
    seid: {
      type: Number,
      default: 0,
      required: false,
    },
    iid: {
      type: Number,
      default: 0,
      required: false,
    },
    pid: {
      type: Number,
      default: 0,
      required: false,
    },
    cid: {
      type: Number,
      default: 0,
      required: false,
    },
    lang: {
      type: String,
      required: false,
      default: 'ru',
    },
  },
  setup() {
    const store = useWidgetStore();
    
    const { cookies } = useCookies();
    cookies.set('token', localStorage.getItem('token'));
    return { cookies };
  },

  data() {
    return {
      user: null,
      frameUrl: {
        'guru.ge': 'saleframe.24ats.com',
        '24afisha.by': 'saleframe.24afisha.by',
        'mtb.24afisha.by': 'saleframe.24afisha.by',
        '24guru.by': 'saleframe.24afisha.by',
        'afisha.24guru.by': 'saleframe.24afisha.by',
        '24.arcom.of.by': 'saleframe.arcom.of.by',
        '24afisha.arcom.of.by': 'saleframe.arcom.of.by',
        'afisha.24.arcom.of.by': 'saleframe.arcom.of.by',
      },
    };
  },

  beforeUnmount() {
    window.removeEventListener('message', this.message);
  },
  deactivated() {
    window.removeEventListener('message', this.message);
  },

  mounted() {
    if (window) {
      window.addEventListener('message', this.message);
    }
  },

  methods: {
    message(msg) {
      if (msg.data && msg.data.action) {
        if (msg.data.action === 'closeFrame') {
          this.$emit('close');
        }
        if (msg.data.action === 'loadWidget') {
          const token = localStorage.getItem('token');
          const tokenCookies = this.cookies.get('token');
          const source = document.getElementById('widget').contentWindow;
          source.postMessage({
            action: 'auth',
            token,
          }, 'https://saleframe.24afisha.by');
        }
      }
    },
    getFrameUrl(sid, seid, iid, pid, cid) {
      console.log(sid, seid, iid, pid, cid);
      let host = 'https://saleframe.24afisha.by';

      if (window && sid && seid && seid > 0) {
        return `${host}?oid=${sid}&seid=${seid}&lang=${this.lang}`;
      }
      if (window && sid && iid && iid > 0) {
        return `${host}/item?oid=${sid}&iid=${iid}&lang=${this.lang}`;
      }
      if (window && pid > 0) {
        return `${host}?pid=${pid}&cid=${import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID}&distributor_company_id=${import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID}&lang=${this.lang}`;
      }
      if (window && cid > 0) {
        return `${host}?oid=${cid}&distributor_company_id=${import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID}&lang=${this.lang}`;
      }
      if (window) {
        return `${host}?sid=${sid}&lang=${this.lang}`;
      }
      return null;
    },

    getFrameOrigin() {
      if (window) {
        let host = configEx.frameUrl;
        return `${host}`;
      }
      return null;
    },
  },
};
</script>
