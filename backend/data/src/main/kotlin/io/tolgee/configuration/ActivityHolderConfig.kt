package io.tolgee.configuration

import io.tolgee.activity.holders.ActivityHolder
import io.tolgee.configuration.TransactionScopeConfig.Companion.SCOPE_TRANSACTION
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Scope
import org.springframework.context.annotation.ScopedProxyMode
import org.springframework.web.context.annotation.RequestScope

@Configuration
class ActivityHolderConfig {
  @Bean
  @Scope(SCOPE_TRANSACTION, proxyMode = ScopedProxyMode.TARGET_CLASS)
  @ConditionalOnMissingBean
  fun transactionActivityHolder(): ActivityHolder {
    return ActivityHolder()
  }

  @Bean
  @RequestScope
  @Primary
  fun requestActivityHolder(): ActivityHolder {
    return ActivityHolder()
  }
}
