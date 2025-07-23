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
          VDialog: {
            template: '<div><slot></slot></div>'
          },
          ChartContainer: true,
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
    console.log(wrapper.html());
    const btn = wrapper.find('[data-test="stats-btn"]');
    await btn.trigger('click');
    await nextTick();
    //console.log(wrapper.html());
    expect(wrapper.html()).toContain('Statistiques');
  });

  /*it('Help opens', async () => {
    const btn = wrapper.find('[data-test="help-btn"]');
    await btn.trigger('click');
    await nextTick();
    expect(wrapper.html()).toContain('Comment jouer ?');
  });

  it('Credits opens', async () => {
    const btn = wrapper.find('[data-test="credits-btn"]');
    await btn.trigger('click');
    await nextTick();
    expect(wrapper.html()).toContain('Crédits');
  });

  it('Lang opens and changes', async () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');

    const btn = wrapper.find('[data-test="lang-btn"]');
    await btn.trigger('click');
    await nextTick();
    await nextTick();

    //const langItems = document.querySelectorAll('.lang-item');
    const langItems = wrapper.findAll('.lang-item');
    console.log(langItems.length);
    langItems[1].trigger('click');
    expect((wrapper.vm as any).lang).toBe('en');
    expect(setItemSpy).toHaveBeenCalledWith('lang', 'en');
  });*/
});