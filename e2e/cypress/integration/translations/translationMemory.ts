import { deleteProject } from '../../common/apiCalls';
import { ProjectDTO } from '../../../../webapp/src/service/response.types';
import {
  create4Translations,
  selectLangsInLocalstorage,
  translationsBeforeEach,
  visitTranslations,
} from '../../common/translations';
import { waitForGlobalLoading } from '../../common/loading';

describe('Translation memory', () => {
  let project: ProjectDTO = null;

  beforeEach(() => {
    translationsBeforeEach()
      .then((p) => (project = p))
      .then(() => {
        create4Translations(project.id);
        selectLangsInLocalstorage(project.id, ['en', 'cs']);
        visit();
      });
  });

  afterEach(() => {
    deleteProject(project.id);
  });

  it('will show correct suggestions', () => {
    waitForGlobalLoading();
    openEditor('Studený přeložený text 1');
    cy.gcy('translation-tools-translation-memory-item').should(
      'have.length',
      3
    );
    cy.gcy('translation-tools-translation-memory-item')
      .contains('Studený přeložený text 2')
      .should('be.visible');
    cy.gcy('translation-tools-translation-memory-item')
      .contains('Studený přeložený text 1')
      .should('not.exist');
  });

  it('will apply suggestion on click', () => {
    waitForGlobalLoading();
    openEditor('Studený přeložený text 1');
    cy.gcy('translation-tools-translation-memory-item')
      .contains('Studený přeložený text 2')
      .should('be.visible')
      .click();
    cy.gcy('global-editor')
      .contains('Studený přeložený text 2')
      .should('be.visible');
  });

  const visit = () => {
    visitTranslations(project.id);
  };

  const openEditor = (text: string) => {
    cy.contains(text).click();
    cy.gcy('global-editor').should('be.visible');
  };
});