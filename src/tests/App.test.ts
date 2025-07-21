import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import App from '../App.vue';
import { nextTick } from 'vue';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

let wrapper: VueWrapper<any>;

describe('App.vue', () => {
  beforeEach(() => {
    //localStorage.clear();
    //push.mockClear();
    wrapper = mount(App, {
      attachTo: document.body,
      global: {
        stubs: {
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
    const btn = wrapper.find('[data-test="stats-btn"]');
    await btn.trigger('click');
    await nextTick();
    console.log(wrapper.html());
    //expect(wrapper.text()).toContain('Statistiques');
  });
});

    //const btns = wrapper.findAll('button');
    //console.log(btns.length);
    //await btns[0].trigger('click');
    //expect(wrapper.text()).toContain('Statistiques');