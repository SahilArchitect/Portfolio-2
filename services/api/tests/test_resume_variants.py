from __future__ import annotations

from app.schemas.resume_variant import ResumeVariantUpdate


def test_resume_update_accepts_pdf_url() -> None:
    update = ResumeVariantUpdate.model_validate(
        {"pdf_url": "https://cdn.example.com/sahil-resume.pdf"}
    )

    assert update.pdf_url == "https://cdn.example.com/sahil-resume.pdf"
