build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

clean:
	docker compose down -v
	docker system prune -f

db-shell:
	docker exec -it funding_postgres psql -U postgres -d funding_arbitrage

app-shell:
	docker exec -it funding_app sh
