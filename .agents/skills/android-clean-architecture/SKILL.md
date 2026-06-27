---
name: android-clean-architecture
description: Clean Architecture patterns for Android and Kotlin Multiplatform projects — module structure, dependency rules, UseCases, Repositories, and data layer patterns.
metadata:
  origin: ECC
---

# Android Clean Architecture

Clean Architecture patterns for Android and KMP projects. Covers module boundaries, dependency inversion, UseCase/Repository patterns, and data layer design with Room, SQLDelight, and Ktor.

## When to Activate

- Structuring Android or KMP project modules
- Implementing UseCases, Repositories, or DataSources
- Designing data flow between layers (domain, data, presentation)
- Setting up dependency injection with Koin or Hilt
- Working with Room, SQLDelight, or Ktor in a layered architecture

## Module Structure

### Recommended Layout

```
project/
├── app/                  # Android entry point, DI wiring, Application class
├── core/                 # Shared utilities, base classes, error types
├── domain/               # UseCases, domain models, repository interfaces (pure Kotlin)
├── data/                 # Repository implementations, DataSources, DB, network
├── presentation/         # Screens, ViewModels, UI models, navigation
├── design-system/        # Reusable Compose components, theme, typography
└── feature/              # Feature modules (optional, for larger projects)
    ├── auth/
    ├── settings/
    └── profile/
```

### Dependency Rules

```
app → presentation, domain, data, core
presentation → domain, design-system, core
data → domain, core
domain → core (or no dependencies)
core → (nothing)
```

**Critical**: `domain` must NEVER depend on `data`, `presentation`, or any framework. It contains pure Kotlin only.

## Domain Layer

### UseCase Pattern

Each UseCase represents one business operation. Use `operator fun invoke` for clean call sites:

```kotlin
class GetItemsByCategoryUseCase(
    private val repository: ItemRepository
) {
    suspend operator fun invoke(category: String): Result<List<Item>> {
        return repository.getItemsByCategory(category)
    }
}

// Flow-based UseCase for reactive streams
class ObserveUserProgressUseCase(
    private val repository: UserRepository
) {
    operator fun invoke(userId: String): Flow<UserProgress> {
        return repository.observeProgress(userId)
    }
}
```

### Domain Models

Domain models are plain Kotlin data classes — no framework annotations:

```kotlin
data class Item(
    val id: String,
    val title: String,
    val description: String,
    val tags: List<String>,
    val status: Status,
    val category: String
)

enum class Status { DRAFT, ACTIVE, ARCHIVED }
```

### Repository Interfaces

Defined in domain, implemented in data:

```kotlin
interface ItemRepository {
    suspend fun getItemsByCategory(category: String): Result<List<Item>>
    suspend fun saveItem(item: Item): Result<Unit>
    fun observeItems(): Flow<List<Item>>
}
```

## Data Layer

### Repository Implementation

Coordinates between local and remote data sources:

```kotlin
class ItemRepositoryImpl(
    private val localDataSource: ItemLocalDataSource,
    private val remoteDataSource: ItemRemoteDataSource,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : ItemRepository {
    override suspend fun getItemsByCategory(category: String): Result<List<Item>> = withContext(ioDispatcher) {
        try {
            // Offline-first pattern
            val localItems = localDataSource.getItemsByCategory(category)
            if (localItems.isNotEmpty()) {
                Result.success(localItems.map { it.toDomain() })
            } else {
                remoteDataSource.fetchItemsByCategory(category)
                    .map { networkItems ->
                        localDataSource.insertItems(networkItems.map { it.toEntity() })
                        networkItems.map { it.toDomain() }
                    }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```
