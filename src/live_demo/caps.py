import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1880,'height':1000},device_scale_factor=2)
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'LeakMark_Live_Demo.html'))); await pg.wait_for_timeout(500)
        await pg.locator('.phone').screenshot(path='ph_scan.png')
        for i in range(4):
            await pg.click('#start-scan'); await pg.wait_for_timeout(3200); await pg.click('#scan-done')
        await pg.click('#send-T-27'); await pg.wait_for_timeout(500); await pg.click('#banner'); await pg.wait_for_timeout(400)
        await pg.locator('.phone').screenshot(path='ph_order.png')
        await pg.screenshot(path='full_dispatch.png')
        await pg.locator('.web').screenshot(path='web_dispatch.png')
        await pg.click('#arrive'); await pg.wait_for_timeout(1700); await pg.click('#c-leak'); await pg.click('#submit-check'); await pg.click('#ph'); await pg.click('#mark-repaired'); await pg.wait_for_timeout(300)
        print('badge hidden after repair:', await pg.evaluate("getComputedStyle(document.getElementById('badge')).display"))
        await b.close()
asyncio.run(main())
