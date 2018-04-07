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
      return this.get('tagsData').map((tagLabel) => {
        return {
          label: tagLabel,
          classNames: this.getTagClassNames(tagLabel)
        }
      });
    }
  }),

  readOnly: false,

  isEditTagModeEnabled: true,

  tagRemoveButtonSvgId: null,

  editInputPlaceholder: 'Enter a tag...',

  newInputPlaceholder: 'Add a tag...',

  splitKeyCodes: null,

  isAutoNewInputWidthEnabled: true,

  isAutoEditInputWidthEnabled: true,

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

  getTagClassNames() {},

  onNewInputKeyDown(e) {
    const newTagLabel = e.target.value.trim();

    if (e.which === KEY_CODES.BACKSPACE) {
      const tags = this.get('tags');

      if (newTagLabel.length === 0 && tags.length > 0) {
        scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(tags.length - 1));
      }
    } else if (this.isSplitKeyCode(e.which)) {
      if (newTagLabel.length > 0) {
        scheduleOnce('afterRender', () => this.onAddTag(newTagLabel));
        e.target.value = '';
      }

      e.preventDefault();
    }
  },

  onEditInputKeyDown(tag, index, e) {
    if (this.isSplitKeyCode(e.which)) {
      const tagLabel = tag.label.trim();

      if (tagLabel.length > 0) {
        scheduleOnce('afterRender', () => this.onEditTagAtIndex(tagLabel, index));
      } else {
        scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
      }

      e.preventDefault();
    }
  },

  onNewInputInput() {
    if (this.get('isAutoNewInputWidthEnabled')) {
      this.updateNewInputWidth();
    }
  },

  onEditInputInput() {
    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }
  },

  onNewInputEnter() {
    if (this.get('isAutoNewInputWidthEnabled')) {
      this.updateNewInputWidth();
    }
  },

  onEditInputEnter(tag) {
    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }

    this.disableEditMode(tag);
  },

  onNewInputFocusOut(e) {
    const newTagLabel = e.target.value.trim();

    if (newTagLabel.length > 0) {
      scheduleOnce('afterRender', () => this.onAddTag(newTagLabel));
      e.target.value = '';
    }

    if (this.get('isAutoNewInputWidthEnabled')) {
      this.updateNewInputWidth();
    }

    e.preventDefault();
  },

  onEditInputFocusOut(tag, index, e) {
    const tagLabel = tag.label.trim();

    if (tagLabel.length > 0) {
      scheduleOnce('afterRender', () => this.onEditTagAtIndex(tagLabel, index));
    } else {
      scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
    }

    this.disableEditMode(tag);

    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }

    e.preventDefault();
  },

  isSplitKeyCode(keyCode) {
    const splitKeyCodes = this.get('splitKeyCodes');

    if (splitKeyCodes) {
      return splitKeyCodes.any((splitKeyCode) => splitKeyCode === keyCode);
    }

    return [
      KEY_CODES.COMMA,
      KEY_CODES.ENTER,
      KEY_CODES.SPACE,
      KEY_CODES.SEMI_COLON
    ].any((splitKeyCode) => splitKeyCode === keyCode);
  },

  onAddTag() {},

  onEditTagAtIndex() {},

  onRemoveTagAtIndex() {},

  focusNewInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getNewInputElement();
      $input.focus();
    });
  },

  focusEditInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getEditInputElement();
      $input.focus();
    });
  },

  updateNewInputWidth() {
    const $input = this.getNewInputElement();

    this.updateInputWidth($input);
  },

  updateEditInputWidth() {
    const $input = this.getEditInputElement();

    this.updateInputWidth($input);
  },

  updateInputWidth($input) {
    const $inputBuffer = this.getInputBufferElement();

    $inputBuffer.text($input.val());
    $input.width($inputBuffer.width());
  },

  getNewInputElement() {
    return this.$('.eti-new-input');
  },

  getEditInputElement() {
    return this.$('.eti-edit-input');
  },

  getInputBufferElement() {
    return this.$('.eti-input-buffer');
  }
});
