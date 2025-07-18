import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

/*const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));*/

describe('App.vue', () => {
  /*beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });*/
  it('click on statistics button', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          ChartContainer: true,
        }
      }
    });
    //const btns = wrapper.findAll('button');
    const img = wrapper.find('img');
    //console.log(img.attributes('src'));
    //expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('logo/cycdle-white.png');
    //console.log(btns.length);
    //await btns[0].trigger('click');
    //expect(wrapper.text()).toContain('Statistiques');
  });
});