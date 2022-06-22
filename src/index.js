import 'normalize.css';
import './sass/index.scss';

// const Swiper = require('./swiper.min');

(function () {
  const MASK = '+__(___)___-____';
  const MIN_MASK = MASK.replace(/[^_]/g, '').length;
  const MATCH_MASK = MASK.match(/_+/g);
  const SEPARATORS_MASK = MASK.match(/[^_]+/g);
  const INDEX_MASK = MATCH_MASK?.reduceRight((all, item) => {
    return [item.length + (all[0] ?? 0), ...all];
  }, []);
  const REG_MASK = INDEX_MASK?.map(
    item => new RegExp(String.raw`\d([\d_]{${item}})$`),
  );
  const FORMAT_MASK = SEPARATORS_MASK?.reduce((all, item, index) => {
    return index
      ? {
          reg: all.reg + String.raw`([\d_]{${MATCH_MASK[index].length}})`,
          rep: all.rep + `${item}$${index + 1}`,
        }
      : {reg: String.raw`([\d_]+)`, rep: `${item}$1`};
  }, {});

  function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      let range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  }

  function setCaretToPos(input, pos) {
    setSelectionRange(input, pos, pos);
  }

  function clickPhone(e) {
    let element = e.currentTarget;
    let numberPhone = element.value.replace(/\D+/g, '');
    if (!element.value) {
      element.value = MASK;
      setCaretToPos(element, element.value.search('_'));
    } else if (numberPhone.length <= MATCH_MASK[0].length) {
      setCaretToPos(element, element.value.search('_'));
    }
  }

  function blurPhone(e) {
    let element = e.currentTarget;
    let numberPhone = element.value.replace(/\D+/g, '');
    if (numberPhone.length === 0) {
      element.value = '';
    }
  }

  function inputPhone(e) {
    let element = e.currentTarget;
    let value = element.value;
    let numberPhone = value.replace(/\D+/g, '');
    if (numberPhone.length) {
      const isIncludes = SEPARATORS_MASK?.map(item => value.includes(item));
      numberPhone = numberPhone.padEnd(MIN_MASK, '_');

      if (isIncludes[1] && isIncludes[2] && !isIncludes[3]) {
        numberPhone = numberPhone.replace(REG_MASK[3], '$1_');
      } else if (isIncludes[1] && !isIncludes[2] && isIncludes[3]) {
        numberPhone = numberPhone.replace(REG_MASK[2], '$1_');
      } else if (!isIncludes[1] && isIncludes[2] && isIncludes[3]) {
        numberPhone = numberPhone.replace(REG_MASK[1], '$1_');
      }

      element.value = numberPhone.replace(
        new RegExp(FORMAT_MASK.reg, 'g'),
        FORMAT_MASK.rep,
      );
    } else if (!numberPhone) {
      element.value = MASK;
    }
    setCaretToPos(element, element.value.search('_'));
  }

  for (let i of document.querySelectorAll('input[type="tel"]')) {
    i.addEventListener('click', clickPhone);
    i.addEventListener('focus', clickPhone);
    i.addEventListener('blur', blurPhone);
    i.addEventListener('input', inputPhone);
  }
})();
