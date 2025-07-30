import { describe, expect, it, beforeEach, vi } from 'vitest';
import Game from '../components/Game.vue';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';

let wrapper: VueWrapper<any>;

const mockRiderList = [
  {
    "id": "1",
    "name": "Rider One",
  },
  {
    "id": "2",
    "name": "Rider Two",
  },
  {
    "id": "3",
    "name": "Rider Three",
  }
];

// Mock fetch if your Game.vue uses it to fetch riders
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockRiderList,
});



describe('Game.vue', () => {
  beforeEach(() => {
    wrapper = mount(Game, {
      attachTo: document.body,
      global: {
        stubs: {
          ChartSpecialities: true,
        }
      }
    });
  });

  //https://test-utils.vuejs.org/guide/
  it('test fetch', async () => {
    expect(globalThis.fetch).toHaveBeenCalled();
    await flushPromises();
    expect(wrapper.vm.riders).toEqual(mockRiderList);
  });
});