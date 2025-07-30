import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Home from '../components/Home.vue';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

describe('Home.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });

  it('function redirection with rider-wt mode', async () => {
    const wrapper = mount(Home);
    const { redirection } = wrapper.vm as any;
    redirection('rider-wt');
    expect(push).toHaveBeenCalledWith({ name: 'game' });
    expect(push).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('mode')).toBe('rider-wt');
  });

  it('function redirection with tdf mode', async () => {
    const wrapper = mount(Home);
    const { redirection } = wrapper.vm as any;
    redirection('tdf');
    expect(push).toHaveBeenCalledWith({ name: 'game-tdf' });
    expect(push).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('mode')).toBe('tdf');
  });

  it('renders French by default', async () => {
    localStorage.setItem('lang', 'fr');
    const wrapper = mount(Home, { props: { lang: 'fr' } });
    expect(wrapper.text()).toContain('Devinez le coureur World Tour');
    expect(wrapper.text()).toContain('Devinez le coureur Pro Tour');
  });

  it('renders English when lang is en', async () => {
    localStorage.setItem('lang', 'en');
    const wrapper = mount(Home, { props: { lang: 'en' } });
    expect(wrapper.text()).toContain('Guess the World Tour rider');
    expect(wrapper.text()).toContain('Guess the Pro Tour rider');
  });

  it('updates language when prop changes', async () => {
    const wrapper = mount(Home, { props: { lang: 'fr' } });
    await wrapper.setProps({ lang: 'en' });
    expect(wrapper.text()).toContain('Guess the World Tour rider');
    expect(wrapper.text()).toContain('Guess the Pro Tour rider');
  });

  it('calls redirection and sets mode in localStorage', async () => {
    const wrapper = mount(Home, { props: { lang: 'en' } })
    const btns = wrapper.findAll('button');
    await btns[0].trigger('click');
    expect(localStorage.getItem('mode')).toBe('rider-wt');
    expect(push).toHaveBeenCalledWith({ name: 'game' });

    await btns[1].trigger('click');
    expect(localStorage.getItem('mode')).toBe('rider-prt');
    expect(push).toHaveBeenCalledTimes(2);
  });
});