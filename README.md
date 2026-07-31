# Doküman Arama & Mükerrer Yükleme Önleme

Dahili doküman yönetim sistemindeki *"dokümanı bulamıyorum"* ve *"aynı dokümanı tekrar yüklüyorum"* şikayetlerini, **mevcut altyapıyı ve veritabanı şemasını değiştirmeden** çözen küçük bir prototip.

**Stack:** React + Vite + TypeScript · .NET 10 Web API · PostgreSQL (`pg_trgm` + `unaccent`) · Docker

## Ne yapıyor

- Doküman listeleme + tip / sahip / tarih filtresi
- Yazım hatası toleranslı arama — "sozlesm" yazınca "Sözleşme"leri buluyor (`pg_trgm` + Türkçe `unaccent`)
- Yüklerken SHA-256 ile mükerrer tespiti — aynı dosya zaten varsa uyarıyor, yeni kopya oluşturmuyor

## Çalıştırma

Gerekli: **Docker** + **Node 18+**

```bash
# 1) DB + API (container'da; host'ta .NET SDK gerekmez)
docker compose up -d

# 2) Client
cd client && npm install && npm run dev
```

- Uygulama: http://localhost:5173
- API / Swagger: http://localhost:5080/swagger

> API'yi container'da çalıştırdığım için, değerlendiren makinede .NET sürümü ne olursa olsun aynı çalışır. Kendi geliştirmemde `docker compose up -d db` + `dotnet run` kullandım.

## Yapı

```
db/        00_init · 01_seed · 02_search_layer  (pg_trgm+unaccent, sidecar tablo, backfill)
server/    .NET 10 Web API — Dapper + ham SQL (EF yok), Dockerfile
client/    React + Vite + TS — TanStack Query, katmanlı (api / hooks / components)
CASE.md    Problem yorumu, kararlar, teknik değerlendirme, iletişim
```

## Bilerek uyduğum kısıtlar

- Mevcut `documents` tablosuna **hiç dokunmadım** — arama ve dedup ayrı `document_search` tablosunda.
- **Yeni altyapı yok** — arama, veritabanının kendi eklentileriyle (`pg_trgm` / `unaccent`).
- **~400ms bütçesi** — GIN trigram index ile korunuyor.

Kararların gerekçeleri, kabul ettiğim riskler ve teknik değerlendirme → case notları dosyasında yer almaktadır.**
