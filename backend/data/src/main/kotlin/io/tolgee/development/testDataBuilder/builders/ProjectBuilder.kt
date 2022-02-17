package io.tolgee.development.testDataBuilder.builders

import io.tolgee.development.testDataBuilder.FT
import io.tolgee.model.ApiKey
import io.tolgee.model.Language
import io.tolgee.model.MtServiceConfig
import io.tolgee.model.Organization
import io.tolgee.model.Permission
import io.tolgee.model.Project
import io.tolgee.model.UserAccount
import io.tolgee.model.dataImport.Import
import io.tolgee.model.key.Key
import io.tolgee.model.translation.Translation

class ProjectBuilder(
  userOwner: UserAccount? = null,
  organizationOwner: Organization? = null,
  val testDataBuilder: TestDataBuilder
) : BaseEntityDataBuilder<Project, ProjectBuilder>() {
  override var self: Project = Project().apply {
    if (userOwner == null && organizationOwner == null) {
      if (testDataBuilder.data.userAccounts.size > 0) {
        this.userOwner = testDataBuilder.data.userAccounts.first().self
      } else if (testDataBuilder.data.organizations.size > 0) {
        this.organizationOwner = testDataBuilder.data.organizations.first().self
      }
      return@apply
    }

    this.userOwner = userOwner
    this.organizationOwner = organizationOwner
  }

  class DATA {
    val permissions = mutableListOf<PermissionBuilder>()
    val languages = mutableListOf<LanguageBuilder>()
    val imports = mutableListOf<ImportBuilder>()
    val keys = mutableListOf<KeyBuilder>()
    val translations = mutableListOf<TranslationBuilder>()
    val apiKeys = mutableListOf<ApiKeyBuilder>()
    val translationServiceConfigs = mutableListOf<MtServiceConfigBuilder>()
  }

  var data = DATA()

  fun addPermission(ft: FT<Permission>) = addOperation(data.permissions, ft)

  fun addApiKey(ft: FT<ApiKey>) = addOperation(data.apiKeys, ft)

  fun addImport(author: UserAccount? = null, ft: FT<Import>) =
    addOperation(data.imports, ImportBuilder(this, author), ft)

  fun addLanguage(ft: FT<Language>) =
    addOperation(data.languages, ft)

  fun addKey(ft: FT<Key>) = addOperation(data.keys, ft).also { it.self { project = this@ProjectBuilder.self } }

  fun addTranslation(ft: FT<Translation>) = addOperation(data.translations, ft)

  fun addMtServiceConfig(ft: FT<MtServiceConfig>) =
    addOperation(data.translationServiceConfigs, ft)
}
