helpers do

  def scrapping_player_stat(name_key)
    #get the player name keyword for getting the correct url

    #findout which years the player play at least one game
    url = "http://www.basketball-reference.com/players/#{name_key[0]}/#{name_key}.html"

    data = Nokogiri::HTML(open(url))
    years_played = []

    if (player_name = data.xpath("//h1").text()) != "File Not Found"
      data.xpath("//table[@id='totals']/tbody/tr[not(contains(@class, 'italic_text'))]").each do |tr|
        years_played << tr.css('td')[0].text[0,4].to_i + 1  
      end

      if years_played.empty?
        puts "The game has no game record."
      else
        games_stat = []
        # yearly_game_stat = {yearlyGameStat: []}
        years_played.each do |year|
          url = "http://www.basketball-reference.com/players/#{name_key[0]}/#{name_key}/gamelog/#{year}/"
          data = Nokogiri::HTML(open(url))
          # year_game_stat = {year: year, yearGameStat: []}
          data.xpath("//table[@id=\"pgl_basic\"]/tbody/tr[not(contains(@class, 'thead')) and not(contains(@class, 'italic_text')) and not(contains(@id, '.0'))]").each do |tr|
            d = tr.css('td')
            each_game = {
              date: d[2].text.strip,
              age: parse_age(d[3].text.strip),
              team: d[4].text.strip,
              homecourt_flag: d[5].text.strip.empty? ? 1 : 0,
              opp: d[6].text.strip,
              result: d[7].text.strip,
              gs_flag: d[8].text.strip,
              mp: d[9].text.strip,
              fg: d[10].text.strip,
              fga: d[11].text.strip,
              three_pt: d[13].text.strip,
              three_pta: d[14].text.strip,
              ft: d[16].text.strip,
              fta: d[17].text.strip,
              orb: d[19].text.strip,
              drb: d[20].text.strip,
              ast: d[22].text.strip,
              stl: d[23].text.strip,
              blk: d[24].text.strip,
              tov: d[25].text.strip,
              pf: d[26].text.strip,
              pts: d[27].text.strip,
              plus_minus: d[28].text.strip
            }
            games_stat << each_game
          end
        end
      end
    else
      puts "There is no such player (#{player_name})."
      raise "There is no such player (#{player_name})."
    end  
    games_stat
  end

  def scrapping_player_namelist(player_name)

    search_term = player_name.strip.gsub(' ','+')

    url = "http://www.basketball-reference.com/player_search.cgi?search=#{search_term}"
    data = Nokogiri::HTML(open(url))

    if data.xpath("/html/body/div[1]/div[3]/table").empty?
      puts "Could not found this player (#{player_name})."
      raise "Could not found this player (#{player_name})."
    else 
      search_result = data.xpath("/html/body/div[1]/div[3]/table/tr")[0..10].map do |tr|
        {
          player_name: tr.css('td')[0].text(),
          player_info: tr.css('td')[3].text() + ' ' + tr.css('td')[4].text()
        }
      end
    end
    search_result

  end

  def scrape_player_namelist
    ('a'..'z').each do |char|
      url = "http://www.basketball-reference.com/players/#{char}/"
      data = Nokogiri::HTML(open(url))

      data.xpath("//div[@id='div_players']/table/tbody/tr").each do |tr|
        Player.create!(
          full_name: tr.css('td')[0].text(),
          position: tr.css('td')[3].text().split('-'),
          height: inches_to_cm(tr.css('td')[4].text()),
          weight: tr.css('td')[5].text(),
          dob: tr.css('td')[6].text(),
          name_key: parse_name_key(tr)
        )
      end
    end
  end

  ###################################################

  def scrape_player_advanced_stat(name_key)
    url = "http://www.basketball-reference.com/players/#{name_key[0]}/#{name_key}.html"
    puts url
    data = Nokogiri::HTML(open(url))
    advanced_stat = []
    data.xpath("//table[@id='advanced']/tbody/tr").each do |tr|
      advanced_stat << {
        season: tr.css('td')[0].text()[0..3].to_i+1,
        mp: tr.css('td')[6].text().to_i,
        per: tr.css('td')[7].text().to_f,
        usg: tr.css('td')[19].text().to_f,
        ortg: tr.css('td')[20].text().to_i, 
        drtg: tr.css('td')[21].text().to_i, 
        ws: tr.css('td')[24].text().to_f 
      }
    end
    advanced_stat
  end


  def scrape_player_draft_pick(year)
    url = "http://www.basketball-reference.com/draft/NBA_#{year}.html"
    data = Nokogiri::HTML(open(url))

    data.xpath("//table[@id='stats']/tbody/tr[not(contains(@class, 'thead'))]")[0..59].each do |tr|
      player_draft_info = {
                full_name: tr.css('td')[3].text(),
                drafted_year: year,
                pick: tr.css('td')[1].text(),
                pick_team: tr.css('td')[2].text(),
                name_key: tr.css('td')[3].child.attributes['href'] ? tr.css('td')[3].child.attributes['href'].value.split('/').last.sub('.html','') : nil
              }
      #Querying the player with the same name_key
      if player_draft_info[:name_key] 
        player = Player.where(name_key: player_draft_info[:name_key]).first
        if player
          #updating the player advanced stat
          player.drafted_year = player_draft_info[:drafted_year]
          player.pick = player_draft_info[:pick]
          player.pick_team = player_draft_info[:pick_team]
          player.advanced_stat = [];
          player.save!
          player_advanced_stat = scrape_player_advanced_stat(player_draft_info[:name_key])
          player_advanced_stat.each do |year_stat|
            player.advanced_stat.push(
              AdvancedStat.new(year_stat)
            )
          end 
        end
      end
    end
  end

#######################################################

  private

  def parse_name_key(tr)
    href_attr = tr.css('a')[0].attribute('href')
    href_attr == nil ? nil : href_attr.value.split('/').last.sub('.html','')
  end

  def normalize_player_info(player_info)
    player_info[:position] = normalize_position(player_info[:position])
    player_info[:height] = inches_to_cm(player_info[:height])
    player_info[:weight] = parse_weight(player_info[:weight])
    player_info
  end

  def normalize_position(position_string)
    position_string.split("and").map do |pos| 
      pos = pos.strip.gsub(/[^\w\s]/, '').split(" ").inject("") do |short_pos, word|
        short_pos += word[0]
      end
    end
  end

  def inches_to_cm(length)
    feet, inches = length.split("-")
    (feet.to_i * 30.48 + inches.to_i * 2.54).round
  end

  def parse_weight(weight)
    weight.split(' ')[0].to_i
  end

  def parse_age(age)
    year, days = age.split('-')
    (year.to_i + days.gsub(/^[0]+/,'').to_i/365.0).round(3)
  end

end
