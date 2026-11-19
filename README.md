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

The site uses a warm, text-first layout with serif headings, simple project lists, and responsive pages. Assets are local, with no external fonts or animation dependencies.

## Running the tests

Install dependencies with `pip install -r requirements.txt` and execute `pytest`.

## Résumé download

The `_resume-download` directory contains a separate Vercel function that serves
the current PDF from private Blob storage. The private source repository publishes
canonical `Resume.pdf` to one fixed object whenever that file changes on its main
branch. Each download reads the current object with caching disabled.

Keep PDFs out of this repository and service deployment bundles. The endpoint
accepts no version or filename parameters. Its storage credential belongs in
Vercel environment variables and the private publisher's Actions secret.

Run the service checks with `npm ci --prefix _resume-download` and
`npm test --prefix _resume-download` using Node 24. Deploy the service from
`_resume-download` after changing its code. GitHub Pages continues to publish the
portfolio separately.
