# Personal Website

A lightweight, multi-page portfolio for Alex Rao, published with GitHub Pages. The site is plain HTML, CSS, and JavaScript with no build step or frontend framework.

## Pages

- Home: introduction and selected work
- Experience: roles, responsibilities, and teaching/community work
- Projects: selected product and systems projects
- About: education and technical toolkit
- Contact: email, GitHub, and LinkedIn

## Preview locally

Start a local server from the repository root:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/`.

The site uses a responsive layout, a small shared stylesheet, and progressive scroll reveals. Motion is disabled when the visitor has requested reduced motion in their operating system.

## Running the tests

Install dependencies with `pip install -r requirements.txt` and execute `pytest`.
