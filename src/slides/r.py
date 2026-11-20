import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':2600,'height':1200})
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'assets.html'))); await pg.wait_for_timeout(400)
        await pg.locator('#logo-w').screenshot(path='logo_white.png',omit_background=True)
        await pg.locator('#hidden').screenshot(path='ill_hidden.png')
        await pg.locator('#tag').screenshot(path='ill_tag.png',omit_background=True)
        await b.close()
asyncio.run(main())
