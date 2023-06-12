import { Migration } from '@mikro-orm/migrations';

export class Migration20230612131452 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "username" text not null;');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_username_unique";');
    this.addSql('alter table "user" drop column "username";');
  }

}
