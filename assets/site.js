
document.addEventListener('DOMContentLoaded',()=>{
 const menu=document.querySelector('.menu-toggle'), links=document.querySelector('.nav-links');
 if(menu&&links){menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Закрыть':'Меню';});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Меню';}));}
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reveals=document.querySelectorAll('.reveal');
 if(reduced||!('IntersectionObserver' in window)){reveals.forEach(el=>el.classList.add('visible'));}
 else{const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el));}
 const wordSpans=document.querySelectorAll('.tagline-text span');
 if(reduced||!('IntersectionObserver' in window)){wordSpans.forEach(s=>s.classList.add('lit'));}
 else{const wordIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('lit');wordIO.unobserve(e.target)}}),{threshold:.8,rootMargin:'0px 0px -12% 0px'});wordSpans.forEach(s=>wordIO.observe(s));}
 const form=document.querySelector('#lead-form');
 if(form){form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const fd=new FormData(form);const topic=form.dataset.topic||'Запрос';const subject=encodeURIComponent('Запрос с сайта СпецДорСервис: '+topic);const body=encodeURIComponent('Направление: '+topic+'\nИмя: '+fd.get('name')+'\nКонтакт: '+fd.get('phone')+'\nЗадача: '+(fd.get('task')||'не указана'));const status=document.querySelector('#form-status');status.textContent='Открываем почтовую программу. Если она не запустилась, напишите на info@sdors.ru.';window.location.href='mailto:info@sdors.ru?subject='+subject+'&body='+body;});}
});
