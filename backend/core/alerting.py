"""
Enterprise Alerting System.
Sends notifications via email, webhooks, and integrations (Slack, PagerDuty style).
"""
import asyncio
import aiohttp
import datetime
from typing import Dict, List, Optional


class AlertManager:
    """Manages alert routing and delivery."""

    def __init__(self):
        self.webhooks: List[str] = []
        self.email_config: Optional[Dict] = None
        self.alert_history: List[Dict] = []

    def configure_webhook(self, webhook_url: str):
        """Add webhook endpoint for alerts."""
        if webhook_url not in self.webhooks:
            self.webhooks.append(webhook_url)

    def configure_email(self, smtp_host: str, smtp_port: int, username: str, password: str):
        """Configure email alerting."""
        self.email_config = {
            "host": smtp_host,
            "port": smtp_port,
            "username": username,
            "password": password
        }

    async def send_alert(
        self,
        severity: str,
        title: str,
        description: str,
        affected_nodes: List[str],
        metadata: Optional[Dict] = None
    ):
        """
        Send alert to all configured channels.

        Args:
            severity: "critical", "warning", or "info"
            title: Alert headline
            description: Detailed description
            affected_nodes: List of node IDs affected
            metadata: Additional context data
        """
        alert = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "severity": severity,
            "title": title,
            "description": description,
            "affected_nodes": affected_nodes,
            "metadata": metadata or {},
            "alert_id": f"MG-{int(datetime.datetime.utcnow().timestamp())}"
        }

        self.alert_history.append(alert)

        # Send to webhooks
        await self._send_to_webhooks(alert)

        # Send email (if configured)
        if self.email_config:
            await self._send_email(alert)

        return alert

    async def _send_to_webhooks(self, alert: Dict):
        """Send alert to all configured webhooks."""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for webhook_url in self.webhooks:
                tasks.append(self._post_webhook(session, webhook_url, alert))

            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

    async def _post_webhook(self, session: aiohttp.ClientSession, url: str, alert: Dict):
        """POST alert to webhook endpoint."""
        try:
            # Format as Slack-style webhook
            payload = {
                "text": f"🚨 *{alert['title']}*",
                "attachments": [{
                    "color": self._severity_color(alert['severity']),
                    "fields": [
                        {"title": "Severity", "value": alert['severity'].upper(), "short": True},
                        {"title": "Alert ID", "value": alert['alert_id'], "short": True},
                        {"title": "Affected Nodes", "value": ", ".join(alert['affected_nodes'][:5]), "short": False},
                        {"title": "Description", "value": alert['description'], "short": False},
                    ],
                    "footer": "MerkleGuard Security Platform",
                    "ts": int(datetime.datetime.utcnow().timestamp())
                }]
            }

            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status != 200:
                    print(f"Webhook failed: {url} - {response.status}")
        except Exception as e:
            print(f"Webhook error: {url} - {e}")

    async def _send_email(self, alert: Dict):
        """Send alert via email (placeholder - requires SMTP config)."""
        # This would use aiosmtplib to send actual emails
        # For demo purposes, we'll just log it
        print(f"📧 Email alert would be sent: {alert['title']}")

    def _severity_color(self, severity: str) -> str:
        """Map severity to color for webhooks."""
        colors = {
            "critical": "#ff004d",
            "warning": "#ffb800",
            "info": "#00d9ff"
        }
        return colors.get(severity, "#808080")

    def get_alert_history(self, limit: int = 50) -> List[Dict]:
        """Get recent alert history."""
        return self.alert_history[-limit:]


# Global alert manager instance
alert_manager = AlertManager()
