import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1880,'height':1000})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'LeakMark_Live_Demo.html'))); await pg.wait_for_timeout(500)
        await pg.screenshot(path='s0_start.png')
        for i in range(5):
            await pg.click('#start-scan'); await pg.wait_for_timeout(3200)
            day=await pg.text_content('#dayLabel'); leak=await pg.text_content('#k-leak')
            print('after scan',i+1,day,'open alerts',leak)
            await pg.click('#scan-done')
            if leak!='0': break
        await pg.screenshot(path='s1_alert.png')
        await pg.click('#send-T-27'); await pg.wait_for_timeout(600)
        await pg.screenshot(path='s2_banner.png')
        await pg.click('#banner'); await pg.wait_for_timeout(300)
        await pg.click('#arrive'); await pg.wait_for_timeout(1700)
        await pg.screenshot(path='s3_onsite.png')
        await pg.click('#c-leak'); await pg.click('#submit-check'); await pg.wait_for_timeout(200)
        await pg.click('#ph'); await pg.click('#mark-repaired'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='s4_repaired.png')
        print('fix kpi', await pg.text_content('#k-fix'), '|', await pg.text_content('#k-fix-sub'))
        await pg.click('#tab-scan')
        for i in range(4):
            await pg.click('#start-scan'); await pg.wait_for_timeout(3200); await pg.click('#scan-done')
        print('day',await pg.text_content('#dayLabel'),'T-27 pill',await pg.text_content('#t-pill'),'freq',await pg.text_content('#t-f'))
        await pg.click('#tab-install'); await pg.select_option('#f-main','B'); await pg.fill('#f-depth','1.1'); await pg.click('#install-tag'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='s5_install.png')
        print('tags', await pg.text_content('#k-read'))
        await pg.click('#reset'); print('reset day', await pg.text_content('#dayLabel'))
        await pg.set_viewport_size({'width':400,'height':900}); await pg.wait_for_timeout(200)
        print('mobile width', await pg.evaluate('document.documentElement.scrollWidth'))
        print('errors',errs); await b.close()
asyncio.run(main())
