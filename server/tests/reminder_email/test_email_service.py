"""Tests for SendGrid email utility."""

# Tests target internal helpers; no stable public surface for these behaviors.
# pylint: disable=protected-access

from reminder_email import email_service


def test_get_sendgrid_http_timeout_default(monkeypatch):
    monkeypatch.delenv("SENDGRID_HTTP_TIMEOUT", raising=False)
    default = email_service._DEFAULT_SENDGRID_HTTP_TIMEOUT
    assert email_service._get_sendgrid_http_timeout() == default


def test_get_sendgrid_http_timeout_from_env(monkeypatch):
    monkeypatch.setenv("SENDGRID_HTTP_TIMEOUT", "45")
    assert email_service._get_sendgrid_http_timeout() == 45.0


def test_get_sendgrid_http_timeout_invalid_falls_back(monkeypatch):
    monkeypatch.setenv("SENDGRID_HTTP_TIMEOUT", "not-a-number")
    default = email_service._DEFAULT_SENDGRID_HTTP_TIMEOUT
    assert email_service._get_sendgrid_http_timeout() == default


def test_validate_email_rejects_injection_like_content():
    assert email_service._validate_email("a@b.com") is True
    assert email_service._validate_email("not-an-email") is False
    assert email_service._validate_email("a@b.com\nBcc: evil@x.com") is False


def test_html_to_plain_strips_tags():
    plain = email_service._html_to_plain("<p>Hello <strong>World</strong></p>")
    assert "Hello" in plain
    assert "World" in plain
    assert "<" not in plain
