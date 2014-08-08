require 'nokogiri'
require 'open-uri'
require 'sinatra'
require 'json'


get '/' do
  File.read(File.join('public/app', 'index.html'))
end

post '/search' do
  {name: "Lebron"}.to_json
end


