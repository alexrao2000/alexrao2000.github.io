import datetime
from bs4 import BeautifulSoup
from pathlib import Path


def test_footer_contains_current_year():
    html_path = Path(__file__).resolve().parents[1] / 'index.html'
    html = html_path.read_text()
    soup = BeautifulSoup(html, 'html.parser')
    footer = soup.find('footer')
    assert footer is not None, 'Footer element not found'
    script = footer.find('script')
    if script and 'new Date().getFullYear()' in script.text:
        script.replace_with(str(datetime.datetime.now().year))
    footer_text = footer.get_text(separator=' ', strip=True)
    current_year = str(datetime.datetime.now().year)
    assert current_year in footer_text
