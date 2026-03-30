"""Tests for SendGrid email utility."""

from reminder_email import email_service


def test_validate_email_rejects_injection_like_content():
    assert email_service._validate_email("a@b.com") is True
    assert email_service._validate_email("not-an-email") is False
    assert email_service._validate_email("a@b.com\nBcc: evil@x.com") is False


def test_html_to_plain_strips_tags():
    plain = email_service._html_to_plain("<p>Hello <strong>World</strong></p>")
    assert "Hello" in plain
    assert "World" in plain
    assert "<" not in plain
