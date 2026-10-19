import { root, setupImageErrors } from './motion';
import { arrive } from './spring';

root.dataset.enhanced = 'true';
setupImageErrors();
// Rows settle in one after another; with reduced motion they only fade.
arrive([...document.querySelectorAll('[data-not-found-arrive]')], 10);
