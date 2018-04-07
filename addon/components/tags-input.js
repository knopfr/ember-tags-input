import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

import layout from 'ember-tags-input/templates/components/tags-input';

const KEY_CODES = {
  BACKSPACE: 8,
  COMMA: 188,
  ENTER: 13,
  SPACE: 32,
  SEMI_COLON: 186
};

export default Component.extend({
  layout,

  classNames: ['eti'],

  tagsData: null,

  tags: computed('tagsData.[]', {
    get() {
      const tags = this.get('tagsData').map((tagLabel) => {
        return {
          label: tagLabel,
          invalid: this.isTagInvalid(tagLabel)
        }
      });

      return this.getSortedTags(tags);
    }
  }),

  readOnly: false,

  onTagClick(tag) {
    this.get('tags').forEach((tag) => this.disableEditMode(tag));

    this.enableEditMode(tag);
    this.focusEditInput();
  },

  enableEditMode(tag) {
    set(tag, 'editMode', true);
  },

  disableEditMode(tag) {
    set(tag, 'editMode', false);
  },

  isTagInvalid() {
    return false;
  },

  getSortedTags(tags) {
    return tags.sort();
  },

  onEditInputInput() {},

  onEditInputEnter(tag, index) {
    const tagLabel = tag.label.trim();

    if (tagLabel.length > 0) {
      scheduleOnce('afterRender', () => this.onEditTagAtIndex(tagLabel, index));
    } else {
      scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
    }

    this.disableEditMode(tag);
  },

  onEditInputKeyDown(e, tag, index) {
    const newTagLabel = e.target.value.trim();

    if (e.which === KEY_CODES.BACKSPACE) {
      if (newTagLabel.length === 0) {
        scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
      }
    }
  },

  onEditInputFocusOut(tag, index) {
    const tagLabel = tag.label.trim();

    if (tagLabel.length > 0) {
      scheduleOnce('afterRender', () => this.onEditTagAtIndex(tagLabel, index));
    } else {
      scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
    }

    this.disableEditMode(tag);
  },

  onNewInputInput() {},

  onNewInputEnter() {},

  onNewInputKeyDown(e) {
    const newTagLabel = e.target.value.trim();

    if (e.which === KEY_CODES.BACKSPACE) {
      const tags = this.get('tags');

      if (newTagLabel.length === 0 && tags.length > 0) {
        this.onRemoveTagAtIndex(tags.length - 1);
      }
    } else {
      if (e.which === KEY_CODES.COMMA || e.which === KEY_CODES.ENTER ||
        e.which === KEY_CODES.SPACE || e.which === KEY_CODES.SEMI_COLON) {
        if (newTagLabel.length > 0) {
          this.onAddTag(newTagLabel);
          e.target.value = '';
        }

        e.preventDefault();
      }
    }
  },

  onNewInputFocusOut(e) {
    const newTagLabel = e.target.value.trim();

    if (newTagLabel.length > 0) {
      scheduleOnce('afterRender', () => this.onAddTag(newTagLabel));
      e.target.value = '';
    }

    e.preventDefault();
  },

  onAddTag() {},

  onEditTagAtIndex() {},

  onRemoveTagAtIndex() {},

  focusEditInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getEditInputElement();
      $input.focus();
    });
  },

  focusNewInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getNewInputElement();
      $input.focus();
    });
  },

  updateEditInputWidth() {
    const $input = this.getEditInputElement();

    this.updateInputWidth($input);
  },

  updateNewInputWidth() {
    const $input = this.getNewInputElement();

    this.updateInputWidth($input);
  },

  updateInputWidth($input) {
    const $inputBuffer = this.getInputBufferElement();

    $inputBuffer.text($input.val());
    $input.width($inputBuffer.width());
  },

  getEditInputElement() {
    return this.$('.eti-edit-input');
  },

  getNewInputElement() {
    return this.$('.eti-new-input');
  },

  getInputBufferElement() {
    return this.$('.eti-input-buffer');
  }
});
