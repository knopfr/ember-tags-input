import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

import layout from 'ember-tags-input/templates/components/ember-tags-input';

const KEY_CODES = {
  BACKSPACE: 8,
  COMMA: 188,
  ENTER: 13,
  SPACE: 32,
  SEMI_COLON: 186
};

/**
 Component converts a user's typing into tags. New tags are created when the user types a comma, space, semi colon
 or hits the enter key. Tags can be removed using the backspace key or by clicking the x button on each tag.
 Tags can be edited by click on existing tag.

 **Usage:**
 ```handlebars
 \{{#ember-tags-input
    tagsData=tags
    onAddTag=(action addTag)
    onEditTagAtIndex=(action editTagAtIndex)
    onRemoveTagAtIndex=(action removeTagAtIndex)
    as |tagLabel|
 }}
  {{tagLabel}}
 {{/ember-tags-input}}
 ```

 ```javascript
 import Controller from '@ember/controller';

 export default Controller.extend({
  tags: null,

  init() {
    this._super(...arguments);

    this.set('tags', ['tag-1', 'tag-2', 'tag-3']);
  },

  addTag(newTagLabel) {
    this.get('tags').addObject(newTagLabel);
  },

  editTagAtIndex(tagLabel, index) {
    this.get('tags').removeAt(index);
    this.get('tags').insertAt(index, tagLabel);
  },

  removeTagAtIndex(index) {
    this.get('tags').removeAt(index);
  }
 });
 ```

 @class EmberTagsInput
 @public
 */
export default Component.extend({
  layout,

  classNames: ['eti'],

  /**
   An array of tags to render.

   @property tagsData
   @type Array[String]
   @public
   */
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

  /**
   If a read only view of the tags should be displayed. If enabled, existing tags can't be edited or removed
   and new tags can't be added.

   @property readOnly
   @type Boolean
   @public
   */
  readOnly: false,

  /**
   Enables tags edit mode.

   @property isEditTagsModeEnabled
   @type Boolean
   @public
   */
  isEditTagsModeEnabled: true,

  /**
   String of svg id for tag remove button.

   @property tagRemoveButtonSvgId
   @type String
   @public
   */
  tagRemoveButtonSvgId: null,

  /**
   The edit tag placeholder text to display when the user hasn't typed anything.

   @property editInputPlaceholder
   @type String
   @public
   */
  editInputPlaceholder: 'Enter a tag...',

  /**
   The new tag placeholder text to display when the user hasn't typed anything. Isn't displayed if readOnly=true.

   @property newInputPlaceholder
   @type String
   @public
   */
  newInputPlaceholder: 'Add a tag...',

  /**
   An array of key codes for adding tag.

   @property splitKeyCodes
   @type Array[Number]
   @public
   */
  splitKeyCodes: null,

  /**
   Enables auto width for new tag input.

   @property isAutoNewInputWidthEnabled
   @type Boolean
   @public
   */
  isAutoNewInputWidthEnabled: true,

  /**
   Enables auto width for edit tag input.

   @property isAutoEditInputWidthEnabled
   @type Boolean
   @public
   */
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

  /**
   Action which occurs when tag should be added.

   @method onAddTag
   @public
   */
  onAddTag() {},

  /**
   Action which occurs when tag should be edited.

   @method onEditTagAtIndex
   @public
   */
  onEditTagAtIndex() {},

  /**
   Action which occurs when tag should be removed.

   @method onRemoveTagAtIndex
   @public
   */
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
