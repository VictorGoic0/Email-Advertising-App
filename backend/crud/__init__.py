"""CRUD operations for database queries."""
from .campaign import (
    get_campaigns_by_user,
    get_campaigns_by_status,
    get_campaign_with_assets,
    link_assets_to_campaign,
)
from .metrics import record_metric

__all__ = [
    "get_campaigns_by_user",
    "get_campaigns_by_status",
    "get_campaign_with_assets",
    "link_assets_to_campaign",
    "record_metric",
]

