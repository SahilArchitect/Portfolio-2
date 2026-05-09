"""Pydantic v2 schemas — the public type contract.

These are the canonical types for the entire system. `packages/types`
regenerates from these via `datamodel-code-generator`. Frontends, the
admin app, and the worker MUST import from `@engine-room/types` rather
than redefining shapes.

Naming convention:
  - `<Name>Base`    — fields shared by Read and Create.
  - `<Name>Create`  — payload for POST / write paths.
  - `<Name>Update`  — partial-update payload (PATCH).
  - `<Name>Read`    — full read-side shape (includes id, timestamps).
"""

from .admin_user import AdminUserBase, AdminUserCreate, AdminUserRead
from .common import Pagination, Timestamped
from .flags import FeatureFlag, FeatureFlagCreate, FeatureFlagRead, FeatureFlagUpdate
from .health import HealthRead
from .inquiry import (
    InquiryBase,
    InquiryCreate,
    InquiryRead,
    InquiryStatus,
    InquiryStatusUpdate,
    InquiryType,
)
from .metrics import PublicMetrics
from .now_entry import NowEntryBase, NowEntryCreate, NowEntryRead, NowEntryUpdate
from .post import PostBase, PostCreate, PostRead, PostSource, PostUpdate
from .project import ProjectBase, ProjectCreate, ProjectRead, ProjectStatus, ProjectUpdate
from .resume_variant import (
    ResumeVariantBase,
    ResumeVariantCreate,
    ResumeVariantRead,
    ResumeVariantUpdate,
)
from .search import Citation, SearchRequest, SearchResponse
from .site_settings import HeroExperiment, HeroVariant, SubstackSettingsUpdate, SubstackState

__all__ = [
    "AdminUserBase",
    "AdminUserCreate",
    "AdminUserRead",
    "Citation",
    "FeatureFlag",
    "FeatureFlagCreate",
    "FeatureFlagRead",
    "FeatureFlagUpdate",
    "HealthRead",
    "HeroExperiment",
    "HeroVariant",
    "InquiryBase",
    "InquiryCreate",
    "InquiryRead",
    "InquiryStatus",
    "InquiryStatusUpdate",
    "InquiryType",
    "NowEntryBase",
    "NowEntryCreate",
    "NowEntryRead",
    "NowEntryUpdate",
    "Pagination",
    "PostBase",
    "PostCreate",
    "PostRead",
    "PostSource",
    "PostUpdate",
    "ProjectBase",
    "ProjectCreate",
    "ProjectRead",
    "ProjectStatus",
    "ProjectUpdate",
    "PublicMetrics",
    "ResumeVariantBase",
    "ResumeVariantCreate",
    "ResumeVariantRead",
    "ResumeVariantUpdate",
    "SearchRequest",
    "SearchResponse",
    "SubstackSettingsUpdate",
    "SubstackState",
    "Timestamped",
]
