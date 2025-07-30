import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import App from '../App.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { nextTick } from 'vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  ],
})

const push = vi.fn();
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
});

let wrapper: VueWrapper<any>;

describe('App.vue', async() => {
  beforeEach(() => {
    wrapper = mount(App, {
      attachTo: document.body,
      global: {
        plugins: [router],
        stubs: {
          ChartStatistics: true,
        }
      }
    });
  });

  it('Logo exists', async () => {
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('logo/cycdle-white.png');
    expect(img.attributes('alt')).toBe('Cycdle Logo');
  });

  it('Logo redirects', async () => {
    const img = wrapper.find('img');
    await img.trigger('click');
    expect(push).toHaveBeenCalledWith('/');
  });

  it('Stats opens', async () => {
    const btn = wrapper.find('[data-test="stats-btn"]');
    await btn.trigger('click');
    expect(document.body.innerHTML).toContain('Statistiques');
  });

  it('Help opens', async () => {
    const btn = wrapper.find('[data-test="help-btn"]');
    await btn.trigger('click');
    expect(document.body.innerHTML).toContain('Comment jouer ?');
  });

  it('Credits opens', async () => {
    const btn = wrapper.find('[data-test="credits-btn"]');
    await btn.trigger('click');
    expect(document.body.innerHTML).toContain('Crédits');
  });

  it('Lang opens and changes', async () => {
    const btn = wrapper.find('[data-test="lang-btn"]');
    await btn.trigger('click');
    await nextTick();
    
    const langItems = document.querySelectorAll('.lang-item');
    (langItems[1] as HTMLElement).click();
    expect((wrapper.vm as any).lang).toBe('en');
  });
});