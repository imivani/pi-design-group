import { root, setupImageErrors } from './motion';
import { arrive, revealOnView } from './spring';

root.dataset.enhanced = 'true';
setupImageErrors();
arrive([...document.querySelectorAll('[data-service-arrive]')], 10);
revealOnView();
