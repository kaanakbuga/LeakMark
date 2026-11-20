import asyncio, os
from playwright.async_api import async_playwright
FPS=30; DUR=10
async def main():
    os.makedirs('frames',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1920,'height':1080})
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'hook.html'))); await pg.wait_for_timeout(300)
        for i in range(FPS*DUR):
            await pg.evaluate(f'render({i/FPS})')
            await pg.screenshot(path=f'frames/f{i:04d}.png')
        await b.close()
asyncio.run(main())
