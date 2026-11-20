import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':2600,'height':1800})
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'brand.html'))); await pg.wait_for_timeout(500)
        for el,name,transparent in [('#icon','LeakMark_Icon.png',True),('#logo','LeakMark_Logo_Square.png',False),('#logo-c','LeakMark_Logo_Circle.png',False),('#logo-h','LeakMark_Logo_Horizontal.png',True),('#banner','LeakMark_Banner.png',False)]:
            await pg.locator(el).screenshot(path=name, omit_background=transparent)
        await b.close()
asyncio.run(main())
