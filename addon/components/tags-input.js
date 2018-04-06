import Component from '@ember/component';
import { get, set, computed } from '@ember/object';

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

  tagsData: null,

  tags: computed('tagsData.[]', {
    get() {
      const tags = this.get('tagsData').map((tagItem) => {
        return {
          title: tagItem,
          invalid: this.isTagInvalid(tagItem)
        }
      });

      return this.getSortedTags(tags);
    }
  }),

  readOnly: false,

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
  },

  openEditMode(tag) {
    set(tag, 'editMode', true);
  },

  closeEditMode(tag) {
    set(tag, 'editMode', false);
  },

  isTagInvalid() {},

  getSortedTags() {},

  _addTag(tag) {
    this.addTag(tag);
  },

  _removeTagAtIndex(index) {
    this.removeTagAtIndex(index);
  },

  addTag() {},

  removeTagAtIndex() {},

  _onNewInputKeyDown() {
    debugger
  },

  _onNewInputKeyUp() {
    debugger
  },

  _onNewInputFocusOut(value) {
    const newTag = value.trim();

    this._addTag(newTag);
  },

  _onEditInputKeyDown() {
    debugger
  },

  _onEditInputKeyUp() {
    debugger
  },

  _onEditInputFocusOut() {}
});
